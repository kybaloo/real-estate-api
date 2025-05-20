#!/bin/bash

echo "🚧 Réattribution des 15 derniers commits à KARBOU Aristide..."

# Étape 1 : Rebase interactif sur les 15 derniers commits
git rebase -i HEAD~15

# Étape 2 : Instructions pour l'utilisateur
echo "✅ Dans l'éditeur qui s'ouvre, remplace tous les 'pick' par 'edit' pour chacun des 15 commits."
echo "📝 Puis enregistre et ferme l'éditeur (souvent : :wq)."

# Étape 3 : Attendre que l'utilisateur ait terminé la première étape
read -p "Appuie sur [Entrée] quand tu as fini d'éditer la liste..."

# Étape 4 : Boucle pour chaque commit à modifier
for i in {1..15}
do
  # Récupère la date originale du commit en cours
  DATE=$(git show --no-patch --no-notes --pretty='%cD')

  echo "🔄 Modification du commit n°$i avec la date : $DATE"

  # Appliquer l’auteur souhaité avec la date originale
  GIT_COMMITTER_DATE="$DATE" git commit --amend --author="KARBOU Aristide <aristidetiger12@gmail.com>" --no-edit

  # Continuer le rebase
  git rebase --continue || break
done

# Étape 5 : Push forcé
read -p "Souhaites-tu pousser les modifications ? (y/n): " choice
if [ "$choice" = "y" ]; then
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  git push origin "$current_branch" --force
  echo "🚀 Push effectué avec succès sur la branche $current_branch !"
else
  echo "✅ Rebase terminé, mais push non effectué. Tu peux le faire manuellement avec :"
  echo "    git push origin <nom-branche> --force"
fi
