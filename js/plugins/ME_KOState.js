/*:
 * @pluginversion 0.0.4 (75%)
 * @log
 * -Creada la función para comprobar condiciones simples
 * -Creadas las condiciones para comprobar que las stats estén a 0
 * -Finalizado el match de states.
 *
 * @plugindesc This plugin enables you to use alternate KO states
 *
 * @author myenemy
 *
 * @help
 * This is a plugin request by Rewele in RPG Maker Forums.
 * The request was a plugin about pasive states that enabled alternative deaths other than defafult one.
 * 
 * It's made so when any of the main stats reaches 0 you can
 * activate one knock out states.
 * 
 * Warning! This only raises the death flag! Your state should
 * be a copy of the original with slightly less priority!
 * 
 * Just add <ME_KOStates: XXX > to a state, where XXX is one of the main stats in the game, just as in the damage calculation formula in the database, for example atk for attack. From then, when the stat becomes 0, the state will activate and the game will count the affected as dead.
 * You can use other plugins' main stats as long as they apply for both actors and npcs, but place their plugin above this one.
 * 
 *
 * @Terms of use
 * - Common:
 * -  Free to use as in money.
 * -  Feel free to modify to redistribute it.
 * -  This plugin comes as is, with no guarantees.
 * -  I'll try to give support about it, but I can't say I will do it for sure.
 * - Non Commercial:
 * -  No credit required unless you modify it then credit yourself, in other words,
 *   no claiming as your own!
 * - Commercial:
 * -  Give credit me as the author of this plugin, I don't mind if you do so in some
 *   scene or some easter egg.
 * -  Report any bugs, incompatibilities and issues with this plugin to me, even if
 *   you have someone else fixing them.
 * 
 * @Terms of redistribution and disambiguation
 * - You must include a link to the original RPG Maker Forums Post plugin.
 * - You can add terms to it, but you can't remove or modify the ones already existent.
 * - You must follow LGPL 2.1.
 *
 * FAQ:
 * Q: When I set a value on XX that's not in the database, it crashes/does nothing.
 * A: The values are hp, mhp, mp, mmp, atk, def, mat, mde ... If you use others from another plugin make sure that plugin is set above this one.
 *
 * Q: Does this plugin have any dependency?
 * A: This plugin comes standalone, so you don't need to have any other plugins for it to work.
 * 
 * Q: Is it compatible with * ?
 * A: I don't know, I can't try all plugins out there! If you find any you can answer the thread and/or send me a pm. I might eventually fix it.
 * 
 * Q: Is it compatible with Yanfly's plugins?
 * A: I don't know, never tested. I have plans to make a version of this plugin as a extension for Yanfly's passive states, but I never checked yet what's below anyone else's plugins, so it might take a while. What do you think of the name ME_X_KOAutoPassiveStates?
 * 
 * Q: Can I set multiple conditions to activate one KO status?
 * A: No, the auto state part of this plugin is quite basic. Maybe the extension version might be able to.
 * 
 * Q: Can I set the same condition to activate multiple KO status?
 * A: Yes, you can, but I don't see the use for this.
 * 
 * Q: Can I set non KO status with this plugin?
 * A: No, the main functionality of this plugin is set the death flag of a state on.
 * 
 *  @ToDo  List:
 * - Release a lite version as a extension for YEP_PasiveStates
*/

//_GameOver
// Scene_Base.prototype.checkGameover = function() {
//     if ($gameParty.isAllDead()) {
//         SceneManager.goto(Scene_Gameover);
//     }
// };


// Game_Party.prototype.isAllDead = function() {
//     if (Game_Unit.prototype.isAllDead.call(this)) {
//         return this.inBattle() || !this.isEmpty();
//     } else {
//         return false;
//     }
// };

// Game_Unit.prototype.isAllDead = function() {
//     return this.aliveMembers().length === 0;
// };

// Game_Unit.prototype.aliveMembers = function () {
//     return this.members().filter(function (member) {
//         return member.isAlive();
//     });
// };

// Game_BattlerBase.prototype.isAlive = function () {
//     return this.isAppeared() && !this.isDeathStateAffected();
// };

//////

// Game_BattlerBase.prototype.isDeathStateAffected = function () {
//     return this.isStateAffected(this.deathStateId());
// };
var deathStates=[];
var deathConditions=[];


var saveTheOriginalLoadDatabase = DataManager.onLoad;
DataManager.isDatabaseLoaded = function (object) {
    saveTheOriginalLoadDatabase.call(this,object);
    
    var note;
    var match;
    for (var i=1;i<$dataStates.length;i++)
    {
        note=$dataStates[i].note;
        match = note.match(/.*<ME_KOStates:\s*([a-zA-Z]{2}\S?)\s?>.*/i);
        if (match)
        {
            deathStates.push(i);
            deathConditions.push(match[1].toLowerCase());
        }
    }
};

Game_BattlerBase.prototype.isDeathStateAffected = function () {
    return this.isStateAffected(this.deathStateId());
};

Game_BattlerBase.prototype.isKnockOutStateAffected = function()
{

}




Game_BattlerBase.prototype.deathStateId = function () {
    return 1;
};





// BattleManager.updateBattleEnd = function() {
//     if (this.isBattleTest()) {
//         AudioManager.stopBgm();
//         SceneManager.exit();
//     } else if (!this._escaped && $gameParty.isAllDead()) {
//         if (this._canLose) {
//             $gameParty.reviveBattleMembers();
//             SceneManager.pop();
//         } else {
//             SceneManager.goto(Scene_Gameover);
//         }
//     } else {
//         SceneManager.pop();
//     }
//     this._phase = null;
// };

BattleManager.checkBattleEnd = function() {
    if (this._phase) {
        if (this.checkAbort()) {
            return true;
        } else if ($gameParty.isAllDead()) {
           this.processDefeat();
            return true;
        } else if ($gameTroop.isAllDead()) { 
            this.processVictory();
            return true;
        }
    }
    return false;
};



//_Revive
Game_BattlerBase.prototype.revive = function() {
    if (this._hp === 0) {
        this._hp = 1;
    }
};

Game_Battler.prototype.removeState = function(stateId) {
    if (this.isStateAffected(stateId)) {
        if (stateId === this.deathStateId()) {
            this.revive();
        }
        this.eraseState(stateId);
        this.refresh();
        this._result.pushRemovedState(stateId);
    }
};

Game_Party.prototype.reviveBattleMembers = function() {
    this.battleMembers().forEach(function(actor) {
        if (actor.isDead()) {
            actor.setHp(1);
        }
    });
};


// _Apply State

// Game_Battler.prototype.refresh = function () {
//     Game_BattlerBase.prototype.refresh.call(this);
//     if (this.hp === 0) {
//         this.addState(this.deathStateId());
//     } else {
//         this.removeState(this.deathStateId());
//     }
// }

var originalRefresh = Game_Battler.prototype.refresh;

Game_Battler.prototype.refresh = function () {
    originalRefresh.call(this);
    for (var i = 0;i<deathConditions.length;i++)
        if (this.deathConditions[i]==0)
            this.addState(deathStates[i]);
};
