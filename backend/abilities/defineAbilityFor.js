const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilityFor(user, group = null) {
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  // 🔓 Visiteur non connecté
  if (!user) {
    can('read', 'Group'); // tout le monde peut lire les groupes
    return new Ability(rules);
  }

  // 🌐 Rôle global
  if (['admin', 'admin_groupe'].includes(user.role)) {
    can('manage', 'Group'); // peut tout faire (create, update, delete, read)
  } else {
    // Utilisateur authentifié mais non admin
    can('read', 'Group');
    can('join', 'Group');
    can('leave', 'Group');
  }

  // 🎯 Rôle local spécifique au groupe (si un groupe est fourni)
  if (group && group.roles) {
    const isPiloteLocal = group.roles.some(
      (r) => r.userId.toString() === user.id && r.role === 'pilote'
    );

    if (isPiloteLocal) {
      can('update', 'Group'); // pilote peut modifier *son propre* groupe
    }
  }

  return new Ability(rules);
}

module.exports = { defineAbilityFor };