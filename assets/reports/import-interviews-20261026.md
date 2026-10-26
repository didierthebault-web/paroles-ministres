# Import de l’archive S-Interviews Ministre

Import du 26 octobre 2026 : 892 nouveaux documents, corpus porté de 1580 à 2472 notices. Le référentiel conserve 29 ministres ; aucun nouveau ministre.

1 097 fichiers inventoriés ; 1 095 textes extraits sans OCR ; un verrou Word ignoré et une image de procédure non documentaire. 83 doublons écartés, 120 documents réservés au contrôle, dont deux pièces portant une restriction explicite d’usage privé.

- Déclaration médiatique : 586
- Entretien radiotélévisé : 291
- Communiqué de presse : 14
- Dossier de presse : 1

## Méthode et limites

Les originaux sont copiés sans modification, identifiés par SHA-256. Extraction par table de morceaux Word binaire, paragraphes XML DOCX (y compris fichiers DOC mal nommés), et couche texte PDF. Aucun OCR nécessaire sur les documents intégrés. Les documents Word ne reçoivent pas de pagination artificielle.

L’attribution repose sur un nom de locuteur, non sur le seul mot-clé de veille. Les communiqués restent attribués à leur institution, avec un lien au ministre explicitement cité. Les prises de parole hors mandat sont des documents de contexte signalés. Une émission à plusieurs ministres ou une correspondance textuelle partielle est réservée au contrôle.

Les doublons sont recherchés par empreinte de fichier, texte normalisé, référence de transcription, puis séquences de cinq mots à ministre/date identiques. Au moins 82 % du texte entrant déjà présent : doublon ; entre 40 et 82 % : contrôle. Un recueil long ne peut pas être écarté parce qu’il contient un court extrait déjà connu. Des reformulations et rediffusions peuvent subsister.

Les dates médiatiques sont des dates de diffusion ; les dates des communiqués sont des dates de publication. Dates absentes ou incohérentes laissées non renseignées. Ni les noms de fichiers ni les dates Word ne servent à inventer une date.

Les titres médiatiques sont descriptifs, générés depuis le média et l’émission ; le texte local conserve tous les locuteurs et les mentions d’extraits. L’indexation est proposée automatiquement, avec preuves et statut à vérifier.

## Publication et droits

Le recueil Veille-Kantar-Media.pdf (209 pages) et Veille-Kantar-Media1.pdf portent une restriction d’usage privé et de diffusion électronique hors contrat. Ils restent au contrôle local ; le recueil n’est ni publié ni transformé en discours fictifs. Les droits de republication des transcriptions médiatiques individuelles ne sont pas établis. Leurs textes et preuves textuelles sont réservés à la copie locale ; la version GitHub Pages présente leurs notices, thèmes et dates, sans transcription ni fichiers Word. Les 15 pièces institutionnelles nouvelles restent accessibles en texte. La recherche publique porte sur les métadonnées et thèmes de ces notices restreintes, et sur le texte intégral des autres documents.

Les 1 580 notices précédentes, les personnes, mandats et décisions documentaires sont préservés. Une sauvegarde SQLite précède l’import. Le CSV joint conserve toutes les décisions et les pièces restant à traiter. Une notice provisoire présentant un recoupement partiel a été retirée du lot avant publication et conservée dans le dossier de contrôle, sans toucher au corpus antérieur.
