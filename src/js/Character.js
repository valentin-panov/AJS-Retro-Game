/**
 * Parent Character class
 * @constructor
 * @var {class} type - some of allowed types
 */
export default class Character {
  constructor(args) {
    if (new.target.name === 'Character') {
      // нельзя создать просто Character
      throw new Error("new Character() won't pass");
    }
    Object.assign(this, args);
    this.name = this.name || `R-${Math.random().toString(36).substring(7)}`;
    this.health = 50;
    this.level = this.level || 1;
    this.type = this.type || 'generic';
  }

  /**
   * Propagate char characteristics according its remained health points
   */
  levelUp() {
    if (this.health <= 0) {
      throw new Error('dead should rest in peace');
    }
    this.attack = Math.max(this.attack, Math.round(this.attack * (0.8 + this.health / 100)));
    this.defence = Math.max(this.defence, Math.round(this.defence * (0.8 + this.health / 100)));
    this.level += 1;
    this.health += 80;
    this.health = this.health < 100 ? this.health : 100;
  }
}
