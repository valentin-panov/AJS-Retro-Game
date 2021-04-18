import Character from '../Character';
import Bowman from '../Types/bowman';

test('Character wont be created by itself', () => {
  function createCharacter() {
    try {
      return new Character({ name: 'Bilbo' });
    } catch (err) {
      throw new Error(err);
    }
  }
  expect(createCharacter).toThrow();
});

test('instance of Bowman (extends Character) should be created', () => {
  const bowman = new Bowman({ name: 'Legolas' });
  expect(bowman).toBeDefined();
});

test('levelUp() should promote only alive character', () => {
  const bowman1st = new Bowman({ name: 'Legolas' });
  const bowman2nd = new Bowman({ name: 'Thranduil', level: 2 });
  bowman1st.health = 0;
  bowman2nd.health = 1;
  bowman2nd.levelUp();
  expect(() => {
    bowman1st.levelUp();
  }).toThrow();
  expect(bowman2nd.level).toBe(3);
});
