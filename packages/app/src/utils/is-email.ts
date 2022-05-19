export default (s: string) => !/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/.test(s);
