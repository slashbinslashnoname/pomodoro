# Todo List - Pomodoro App

Shadcn UI
 Beautiful Shadcn UI components - modern and clean design
## Fonctionnalités de base
- [x] Affichage initial du minuteur à "25:00".
- [x] Web workers pour la minuterie car on ne peux pas utiliser setInterval dans le main thread.
- [x] Bouton "Start" pour démarrer le minuteur.
- [x] Bouton "Pause" pour mettre en pause le minuteur.
- [x] Bouton "Reset" pour réinitialiser le minuteur.
- [x] Mise à jour de l'affichage du minuteur en temps réel.
- [x] Passage automatique entre les sessions de travail ("Work") et de pause ("Break") une fois le temps écoulé.

## Fonctionnalités à implémenter
- [x] Démarrage automatique de la session suivante.
- [x] Notifications de bureau à la fin de chaque session.
- [x] Notification lorsqu'il reste 20% à la session en cours.
- [x] Notification lorsque la pause est terminée.
- [x] Option pour configurer les durées des sessions de travail et des pauses.
- [x] Historique des sessions (nombre de sessions complétées, temps total travaillé, heure de début et de fin des sessions).
- [x] Bouton ou action permettant de redémarrer la session actuelle sans changer de session.
- [x] Amélioration de l'interface utilisateur (animations, transitions, feedback visuel lors du changement de session).
- [x] Bouton pour activer/désactiver les notifications qui active ou désactive les notifications de bureau.
- [x] Sauvegarde les sessions et les paramètres dans le localstorage pour ne pas perdre les données lorsque le navigateur est fermé.
- [x] Bouton pour activer/désactiver le mode sombre.
- [x] Component tasks to manage a list of tasks.
    - [x] Add tasks
    - [x] Delete tasks
    - [ ] Mark tasks as complete

## Idées futures
- [x] Thèmes personnalisables (mode sombre / clair).
- [ ] Synchronisation avec un calendrier pour planifier les sessions.
- [ ] Intégration avec d'autres outils de gestion de temps ou de notifications (ex : Slack).
- [ ] Amélioration du SEO (balises sémantiques, métadonnées). 