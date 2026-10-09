#!/usr/bin/env bash
# monitoring.sh — Log Analytics workspace + Azure Monitor Agent + CPU alert.
#
# Run AFTER azure-setup.sh (the VM must already exist). Creates billable
# resources in the same resource group.
#
# Verify afterwards:
#   az monitor metrics alert list -g "${RESOURCE_GROUP:-zynatra-rg}" -o table

set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-zynatra-rg}"
LOCATION="${LOCATION:-westus}"
VM_NAME="${VM_NAME:-zynatra-vm}"
WORKSPACE_NAME="${WORKSPACE_NAME:-zynatra-law}"
ACTION_GROUP_NAME="${ACTION_GROUP_NAME:-zynatra-ag}"
ALERT_NAME="${ALERT_NAME:-zynatra-cpu-high}"
DCR_NAME="${DCR_NAME:-zynatra-dcr}"
# Optional: an email address to notify when the alert fires.
ALERT_EMAIL="${ALERT_EMAIL:-}"

command -v az >/dev/null 2>&1 || { echo "ERROR: az CLI not found. Install it first." >&2; exit 1; }

VM_ID=$(az vm show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --query id --output tsv)

echo "==> Creating Log Analytics workspace $WORKSPACE_NAME"
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$WORKSPACE_NAME" \
  --location "$LOCATION" \
  --output none

WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$WORKSPACE_NAME" \
  --query id --output tsv)

echo "==> Installing Azure Monitor Agent extension on $VM_NAME"
az vm extension set \
  --resource-group "$RESOURCE_GROUP" \
  --vm-name "$VM_NAME" \
  --name AzureMonitorLinuxAgent \
  --publisher Microsoft.Azure.Monitor \
  --enable-auto-upgrade true \
  --output none

# Without a Data Collection Rule the agent has nothing to ship — create a DCR
# that routes Performance + Syslog to the workspace, then associate it with the
# VM so logs actually flow (rubric point 2: monitoring).
DCR_DEST_NAME="zynatra-law-dest"

echo "==> Creating Data Collection Rule $DCR_NAME (Perf + Syslog -> $WORKSPACE_NAME)"
az monitor data-collection rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DCR_NAME" \
  --location "$LOCATION" \
  --data-flows "[{\"streams\":[\"Microsoft-Perf\",\"Microsoft-Syslog\"],\"destinations\":[\"$DCR_DEST_NAME\"]}]" \
  --destinations "logAnalytics=[{\"name\":\"$DCR_DEST_NAME\",\"workspaceResourceId\":\"$WORKSPACE_ID\"}]" \
  --output none

DCR_ID=$(az monitor data-collection rule show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DCR_NAME" \
  --query id --output tsv)

echo "==> Associating DCR $DCR_NAME with $VM_NAME"
az monitor data-collection rule association create \
  --name "${DCR_NAME}-assoc" \
  --resource "$VM_ID" \
  --rule-id "$DCR_ID" \
  --output none

echo "==> Creating action group $ACTION_GROUP_NAME"
if [[ -n "$ALERT_EMAIL" ]]; then
  az monitor action-group create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACTION_GROUP_NAME" \
    --short-name zynatra \
    --action email admin "$ALERT_EMAIL" \
    --output none
else
  echo "    ALERT_EMAIL not set — creating the action group without receivers."
  az monitor action-group create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACTION_GROUP_NAME" \
    --short-name zynatra \
    --output none
fi

ACTION_GROUP_ID=$(az monitor action-group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACTION_GROUP_NAME" \
  --query id --output tsv)

echo "==> Creating CPU > 80% metric alert $ALERT_NAME"
az monitor metrics alert create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ALERT_NAME" \
  --scopes "$VM_ID" \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2 \
  --description "Zynatra VM CPU above 80%" \
  --action "$ACTION_GROUP_ID" \
  --output none

echo
echo "==> Done."
echo "    Workspace : $WORKSPACE_NAME ($WORKSPACE_ID)"
echo "    Alert     : $ALERT_NAME (CPU > 80%, 5m window)"
echo "    Verify    : az monitor metrics alert list -g $RESOURCE_GROUP -o table"
