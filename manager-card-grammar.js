const ranchManagerCard = cardManager;
cardManager = function(m) {
  const count = Number(m?.serviceTime || 0);
  const html = ranchManagerCard(m);
  return count === 1
    ? html.replace(' • 1 seasons</div>', ' • 1 season</div>')
    : html;
};
