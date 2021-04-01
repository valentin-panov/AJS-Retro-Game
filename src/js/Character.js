export default class Character {
  constructor(level, type = 'generic') {
    if (new.target.name === 'Character') {
      // нельзя создать просто Character
      throw new Error("new Character() won't pass");
    }
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
}
