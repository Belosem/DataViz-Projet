# DataViz-Projet
Project for Vizualisation of RU-UKR Conflict using D3JS.

# Authors
- Chafaatou Mahamadou Kona
- Melvyn Bertolone

# UI Framework
Material : https://material.angular.io/

# Installation and running
-  Go to web project:
    ```shell
        cd dataViz-project
    ```
- Install dependencies :
    ```shell
        npm install
    ```
- Run the server: 
    ```shell
        ng serve
    ```

# Data
- Ukraine Geojson: https://github.com/EugeneBorshch/ukraine_geojson/tree/master
- Russia GeoJson: https://github.com/simp37/Russia_geoJSON
- Conflict data: https://geoconfirmed.org/api/placemark/Ukraine

# Cadrage

## Problème abordé / Besoin auquel le projet répond

Le site de visualisation du conflit Russo-Ukrainien répond au besoin croissant de compréhension et d'accès facile aux événements liés à ce conflit complexe. Face à la surabondance d'informations dispersées, souvent contradictoires, et à la difficulté pour les utilisateurs de suivre l'évolution temporelle des événements, ce projet vise à fournir une plateforme interactive et informative. En combinant une carte interactive, une timeline, des médias liés à chaque événement, et une heatmap d'activité, le site vise à offrir une expérience utilisateur complète pour comprendre et suivre de manière claire et objective l'évolution du conflit Russo-Ukrainien, tout en encourageant la vérification des faits à partir de sources fiables.

## Public cible et tâches effectuées dans ce projet

Cette visualisation s'adresse à un public varié, comprenant des chercheurs, des journalistes, des décideurs politiques, des étudiants, et le grand public souhaitant comprendre l'évolution complexe de ce conflit. 
Les principales tâches que le projet permettra d'accomplir sont :

- Analyser les événements les plus récents du conflit Russo-Ukrainien.
- Vérifier l'authenticité des événements en accédant à des preuves multimédias associées, telles que des images et des vidéos.
- Explorer l'évolution temporelle du conflit pour identifier les périodes d'activité intense et les moments de relative stabilité.

## Sources de données choisies

- Données géographiques des régions de l'Ukraine: https://github.com/EugeneBorshch/ukraine_geojson/tree/master
- Données géographiques des régions de la Russie: https://github.com/simp37/Russia_geoJSON
Intérêt principal : Ces données fournissent des informations géographiques détaillées sur les régions des deux pays, ce qui est essentiel pour créer une carte interactive précise. Elles permettent de visualiser les événements dans leur contexte spatial.
Limites potentielles : Les données peuvent devenir obsolètes si des changements territoriaux surviennent. La précision dépend de la mise à jour régulière du jeu de données.
- Données relatives aux évènements conflictuels: https://geoconfirmed.org/api/placemark/Ukraine
Intérêt principal : Ces données offrent des informations spécifiques (preuves, types d'évènements ...) sur les événements liés au conflit Russo-Ukrainien, permettant une mise à jour en temps réel de la carte interactive et de la timeline.
Les limites potentielles de ces données sont entre autresla fiabilité de la source et nous garantissons qu'elles proviennent de source sûre. Chaque évènement est lié à sa source dans la visualisation.

## Travaux important liés au projet

https://geoconfirmed.org

## Organisation

- Moyens de communication : Discord, Tracking Github
- Rôles identifiés : design, développement D3, développement frontend

## Scan des esquisses

![alt text](./dataViz-project/src/assets/sketch/sketch_1.png)