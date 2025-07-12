export const hashedPassword = (password: string): Promise<string> => {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export const comparePassword = (password: string, hashedPassword: string): Promise<boolean> => {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hashedPassword);
}