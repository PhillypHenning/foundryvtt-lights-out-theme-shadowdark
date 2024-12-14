export function openSheet() {
  let actor;

  if (this.dataset.token === "true") {
    let scene = game.canvas.scene;
    actor = scene.tokens.find(item => item.delta.id === this.dataset.id).actor;
  }
  else {
    actor = game.actors.get(this.dataset.id);
  }

  console.log(actor);

  if (actor) {
    actor.sheet.render(true);
  }
}

export function selectToken() {
  const actor = game.actors.get(this.dataset.id);
  if (!actor) return;

  const tokens = actor.getActiveTokens();
  if (tokens.length > 0) {
    tokens[0].control();
  }
}

export function changeLuck() {
  let actor = game.actors.get(this.dataset.id);

  if (actor) {
    actor.update({ "system.luck.available": !actor.system.luck.available });
  }
}

export function changePulpLuck(_, change) {
  let actor = game.actors.get(this.dataset.id);

  if (actor) {
    let luckValue = parseInt(actor.system.luck.remaining + change);
    if (luckValue < 0) luckValue = 0;
    
    const updateData = {
      "system.luck.available": luckValue > 0,
      "system.luck.remaining": luckValue,
    };

    actor.update(updateData);
  }
}
