import bcrypt from 'bcryptjs';

// Función para hashear contraseñas
const hashPassword = async (password) => {
	const saltRounds = 12;
	return await bcrypt.hash(password, saltRounds);
};

// Función para verificar contraseñas
const verifyPassword = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword);
};

export {
	hashPassword,
	verifyPassword
};

