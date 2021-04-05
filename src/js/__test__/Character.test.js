import Character from '../Character';
import Bowman from '../Types/bowman';

test('Character wont be created by itself', () => {
  function createCharacter() {
    try {
      return new Character('Bilbo');
    } catch (err) {
      throw new Error(err);
    }
  }
  expect(createCharacter).toThrow();
});

test('instance of Bowman (extends Character) should be created', () => {
  const bowman = new Bowman('Legolas');
  expect(bowman).toBeDefined();
});
