export const isEmail = (s: string) => !/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/.test(s);
