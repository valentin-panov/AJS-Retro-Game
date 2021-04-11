export default class Character {
  constructor(level, type = 'generic', name) {
    if (new.target.name === 'Character') {
      // нельзя создать просто Character
      throw new Error("new Character() won't pass");
    }
    this.name = name;
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    if (type !== 'bowman' && type !== 'magician' && type !== 'swordsman') {
      this.lordAi = true;
    }
    if (type === 'bowman' || type === 'magician' || type === 'swordsman') {
      this.lordAi = false;
    }
  }

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
