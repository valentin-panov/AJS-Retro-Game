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

test('default character level should be 1', () => {
  const bowman = new Bowman({ name: 'Legolas' });
  expect(bowman.level).toBe(1);
});

test('default health should be 50', () => {
  const bowman = new Bowman({ name: 'Legolas' });
  expect(bowman.health).toBe(50);
});

test('character name should be set, when it is defined', () => {
  const bowman = new Bowman({ name: 'Legolas' });
  expect(bowman.name).toBe('Legolas');
});

test('character level should be set, when it is defined', () => {
  const bowman = new Bowman({ name: 'Legolas', level: 2 });
  expect(bowman.level).toBe(2);
});

test('character type should be set, according to the children class', () => {
  const bowman1st = new Bowman({ name: 'Legolas' });
  const bowman2nd = new Bowman({ name: 'Thranduil', type: 'alien' });
  expect(bowman1st.type).toBe('bowman');
  expect(bowman2nd.type).toBe('bowman');
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

test('levelUp() should restore health', () => {
  const bowman1st = new Bowman({ name: 'Legolas' });
  const bowman2nd = new Bowman({ name: 'Thranduil' });
  bowman1st.health = 10;
  bowman2nd.health = 30;
  bowman1st.levelUp();
  bowman2nd.levelUp();
  expect(bowman1st.health).toBe(90);
  expect(bowman2nd.health).toBe(100);
});

test('levelUp() should increase attack/defence according remained health points', () => {
  const bowman1st = new Bowman({ name: 'Legolas' });
  const bowman2nd = new Bowman({ name: 'Thranduil' });
  bowman1st.health = 10;
  bowman2nd.health = 30;
  bowman1st.levelUp();
  bowman2nd.levelUp();
  expect(bowman1st.attack).toBe(25);
  expect(bowman1st.defence).toBe(25);
  expect(bowman2nd.attack).toBe(28);
  expect(bowman2nd.defence).toBe(28);
});
