import React from "react";
import { useData } from "../../context/DataContext";
import GameCenter from "../../components/GameCenter";

export default function GamesHub() {
  const { studentInfo, finishGame } = useData();

  if (!studentInfo) return <div>Cargando arena de juegos...</div>;

  return (
    <div className="animate-fade-in">
      <GameCenter studentInfo={studentInfo} finishGame={finishGame} />
    </div>
  );
}
