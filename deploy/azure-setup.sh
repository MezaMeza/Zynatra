#!/usr/bin/env bash
# azure-setup.sh — provision the Zynatra production VM + network on Azure.
#
# Creates a hardened Ubuntu 22.04 server in a student-policy-allowed region
# (default westus) with only ports 22/80 reachable, a non-root sudo user,
# key-only SSH, UFW + fail2ban and Docker.
#
# This script creates BILLABLE resources. Do NOT run it until you have logged
# in (`az login`) and checked your regional quota.
#
# Phase 0 — check quota FIRST (Standard_B1ms needs 1 BS-family vCPU):
#   az vm list-usage -l westus -o table
#   #  -> read "Total Regional vCPUs" and the "Standard BS Family" rows.
#   #  If BS-family quota is 0, re-run with VM_SIZE=Standard_B2s (2 vCPU) if the
#   #  quota allows, or request a quota increase. Last resort: Azure Container
#   #  Apps / ACI.
#
# Region policy: Azure for Students assigns a "sys.regionrestriction" policy
# allowing ONLY: canadacentral, germanywestcentral, spaincentral, westus,
# norwayeast. eastus is BLOCKED.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration (override via environment variables).
# ---------------------------------------------------------------------------
RESOURCE_GROUP="${RESOURCE_GROUP:-zynatra-rg}"
LOCATION="${LOCATION:-westus}"
VM_NAME="${VM_NAME:-zynatra-vm}"
# Standard_B1ms is the cheap baseline (1 vCPU / 2 GB). Standard_B2s is the
# fallback if the BS-family quota allows 2 vCPUs.
VM_SIZE="${VM_SIZE:-Standard_B1ms}"
IMAGE="${IMAGE:-Ubuntu2204}"
ADMIN_USER="${ADMIN_USER:-zynatra}"
NSG_NAME="${NSG_NAME:-zynatra-nsg}"
PUBLIC_IP_NAME="${PUBLIC_IP_NAME:-zynatra-ip}"
SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa.pub}"
# Restrict SSH to a single admin address where possible. '*' works but is less
# secure; prefer your own IP (e.g. ADMIN_IP=203.0.113.7).
ADMIN_IP="${ADMIN_IP:-*}"

command -v az >/dev/null 2>&1 || { echo "ERROR: az CLI not found. Install it first." >&2; exit 1; }
[[ -f "$SSH_KEY_PATH" ]] || { echo "ERROR: SSH public key not found at $SSH_KEY_PATH" >&2; exit 1; }

echo "==> Creating resource group $RESOURCE_GROUP in $LOCATION"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "==> Creating static public IP $PUBLIC_IP_NAME"
az network public-ip create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PUBLIC_IP_NAME" \
  --sku Standard \
  --allocation-method Static \
  --output none

echo "==> Creating NSG $NSG_NAME with only rules 22 and 80"
az network nsg create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$NSG_NAME" \
  --output none

az network nsg rule create \
  --resource-group "$RESOURCE_GROUP" \
  --nsg-name "$NSG_NAME" \
  --name allow-ssh \
  --priority 1000 \
  --access Allow \
  --protocol Tcp \
  --direction Inbound \
  --destination-port-ranges 22 \
  --source-address-prefixes "$ADMIN_IP" \
  --output none

az network nsg rule create \
  --resource-group "$RESOURCE_GROUP" \
  --nsg-name "$NSG_NAME" \
  --name allow-http \
  --priority 1010 \
  --access Allow \
  --protocol Tcp \
  --direction Inbound \
  --destination-port-ranges 80 \
  --source-address-prefixes '*' \
  --output none

echo "==> Creating VM $VM_NAME ($VM_SIZE, $IMAGE)"
az vm create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --location "$LOCATION" \
  --image "$IMAGE" \
  --size "$VM_SIZE" \
  --admin-username "$ADMIN_USER" \
  --ssh-key-values "$SSH_KEY_PATH" \
  --public-ip-address "$PUBLIC_IP_NAME" \
  --nsg "$NSG_NAME" \
  --output none

# ---------------------------------------------------------------------------
# Server hardening + Docker, executed remotely over SSH as the admin user.
# The heredoc is quoted so $USER expands on the VM, not locally.
# ---------------------------------------------------------------------------
REMOTE_SCRIPT=$(cat <<'REMOTE'
set -euo pipefail

# 1) SSH key-only authentication (main config + cloud-init drop-ins).
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/*.conf 2>/dev/null || true
sudo sed -i 's/^#\?ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd

# 2) UFW: deny incoming by default, allow only 22 and 80.
sudo apt-get update -y
sudo apt-get install -y ufw fail2ban
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw --force enable

# 3) fail2ban for SSH brute-force protection.
sudo systemctl enable --now fail2ban

# 4) 2 GB swapfile — mitigates OOM on the 2 GB Standard_B1ms while the image
#    builds (npm ci + vite build are memory hungry).
if [[ ! -f /swapfile ]]; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# 5) Docker Engine + Compose plugin.
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
REMOTE
)

VM_IP=$(az vm show --show-details --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --query publicIps --output tsv)

echo "==> Hardening VM and installing Docker over SSH ($VM_IP)"
ssh -o StrictHostKeyChecking=accept-new "${ADMIN_USER}@${VM_IP}" "bash -s" <<<"$REMOTE_SCRIPT"

echo
echo "==> Done."
echo "    Public IP : $VM_IP"
echo "    SSH       : ssh ${ADMIN_USER}@${VM_IP}"
echo "    Next      : copy docker-compose.yml, nginx/ and .env to the VM,"
echo "                then run 'docker compose up -d --build'."
echo "    Teardown  : az group delete --name $RESOURCE_GROUP --yes --no-wait"
