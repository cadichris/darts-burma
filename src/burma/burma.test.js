import deepFreeze from "deep-freeze";
import { burma } from "./burma";
import { inscrireJoueur, demarrerPartie, voleeChiffree } from "./actions";
import { POINTS_INITIAUX } from "./scores";

it("retourne le state initial", () => {
  expect(burma(undefined, {})).toEqual({
    chiffreCourant: undefined,
    joueurs: [],
    lanceur: undefined,
    phase: "INSCRIPTION",
    scores: [],
    vainqueur: undefined
  });
});

it("inscrit un joueur", () => {
  const unJoueurInscrit = executer([inscrireJoueur("J1")]);
  expect(unJoueurInscrit).toEqual({
    chiffreCourant: undefined,
    joueurs: ["J1"],
    lanceur: undefined,
    phase: "INSCRIPTION",
    scores: [{ joueur: "J1", points: POINTS_INITIAUX, touches: {} }]
  });
});

it("démarre la partie", () => {
  const burmaEnCoursAvec2joueurs = executer([
    inscrireJoueur("J1"),
    inscrireJoueur("J2"),
    demarrerPartie()
  ]);

  expect(burmaEnCoursAvec2joueurs).toEqual({
    chiffreCourant: 15,
    joueurs: ["J1", "J2"],
    lanceur: "J1",
    phase: "EN_COURS",
    scores: [
      { joueur: "J1", points: POINTS_INITIAUX, touches: {} },
      { joueur: "J2", points: POINTS_INITIAUX, touches: {} }
    ],
    vainqueur: undefined
  });
});

it("note une volée", () => {
  const burma1joueur = burma(undefined, inscrireJoueur("J1"));
  const burma2joueurs = burma(burma1joueur, inscrireJoueur("J2"));
  const burmaEnCours = burma(burma2joueurs, demarrerPartie());

  const j1faitUn15 = burma(burmaEnCours, voleeChiffree("J1", 15, 1));
  expect(j1faitUn15).toEqual({
    chiffreCourant: 15,
    joueurs: ["J1", "J2"],
    lanceur: "J2",
    phase: "EN_COURS",
    scores: [
      {
        joueur: "J1",
        points: POINTS_INITIAUX + 15 * 1,
        touches: { 15: [{ chiffre: 15, nombre: 1 }] }
      },
      {
        joueur: "J2",
        points: POINTS_INITIAUX,
        touches: {}
      }
    ],
    vainqueur: undefined
  });

  const j2faitDeux15 = burma(j1faitUn15, voleeChiffree("J2", 15, 2));
  expect(j2faitDeux15).toEqual({
    chiffreCourant: 16,
    joueurs: ["J1", "J2"],
    lanceur: "J1",
    phase: "EN_COURS",
    scores: [
      {
        joueur: "J1",
        points: POINTS_INITIAUX + 15 * 1,
        touches: { 15: [{ chiffre: 15, nombre: 1 }] }
      },
      {
        joueur: "J2",
        points: POINTS_INITIAUX + 15 * 2,
        touches: { 15: [{ chiffre: 15, nombre: 2 }] }
      }
    ],
    vainqueur: undefined
  });
});

it("termine la partie après la dernière volée du dernier joueur", () => {
  const bull = "B";
  const derniereVoleeDuDernierJoueur = voleeChiffree("J2", bull, 1);
  const burmaTermine = executer([
    inscrireJoueur("J1"),
    inscrireJoueur("J2"),
    demarrerPartie(),
    derniereVoleeDuDernierJoueur
  ]);

  expect(burmaTermine.phase).toBe("TERMINEE");
  expect(burmaTermine.vainqueur).toBe("J2");
});

const executer = actions =>
  actions.reduce((state, action) => {
    const nextState = burma(state, action);
    deepFreeze(nextState);
    return nextState;
  }, undefined);
