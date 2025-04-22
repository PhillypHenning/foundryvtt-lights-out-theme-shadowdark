import * as actions from "./actions.js";

export function setupLuckTracker(element) {
  const pulpMode = game.settings.get("shadowdark", "usePulpMode");
        
    // Setup listeners for the luck token tracker
    const luckTracker = document.querySelector(element);
    if (luckTracker) {
        luckTracker.addEventListener("click", (e) => {
            if (pulpMode) {
                actions.changePulpLuck.call(luckTracker, e, 1);
            } else {
                actions.changeLuck.call(luckTracker, e);
            }
        });

        luckTracker.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // Prevent the default context menu
            if (pulpMode) {
                actions.changePulpLuck.call(luckTracker, e, -1);
            } else {
                actions.changeLuck.call(luckTracker, e);
            }
        });
    }
} 

export function setupHealthPointsTracker(element) {
    document.querySelector(element).addEventListener("focus", function () {
        this.value = "";
    });

    document.querySelector(element).addEventListener("blur", function () {
        this.value = this.dataset.value;
    });

    document.querySelector(element).addEventListener("keyup", function (e) {
        if (e.keyCode !== 13) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        let actor;
        if (this.dataset.token === "true") {
            let scene = game.canvas.scene;
            actor = scene.tokens.find(item => item.delta.id === this.dataset.id).actor;
        } else {
            actor = game.actors.get(this.dataset.id);
        }

        if (!actor) {
            return;
        }

        const currentHP = this.dataset.value;
        const inputValue = this.value.trim();

        let damageAmount;
        let multiplier;

        if (inputValue.startsWith('+')) {
            damageAmount = parseInt(inputValue.slice(1), 10);
            multiplier = -1;
        } else if (inputValue.startsWith('-')) {
            damageAmount = parseInt(inputValue.slice(1), 10);
            multiplier = 1;
        } else {
            const newHP = parseInt(inputValue, 10);
            damageAmount = currentHP - newHP;
            multiplier = 1;
        }

        if (!isNaN(damageAmount)) {
            actor.applyDamage(damageAmount, multiplier);
        }
    });
}
