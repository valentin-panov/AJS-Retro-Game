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

test('levelUp() should promote only alive character', () => {
  const bowman1st = new Bowman('Legolas');
  const bowman2nd = new Bowman('Thranduil');
  bowman1st.health = 0;
  bowman2nd.health = 1;
  bowman2nd.levelUp();
  expect(() => {
    bowman1st.levelUp();
  }).toThrow();
  expect(bowman2nd.level).toBe(2);
});
