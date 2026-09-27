import { randomBytes, scrypt, ScryptOptions, timingSafeEqual } from 'node:crypto';

function scryptAsync(
	password: string,
	salt: Buffer,
	keyLength: number,
	options: ScryptOptions,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, keyLength, options, (err, key) => (err ? reject(err) : resolve(key)));
	});
}

const KEY_LENGTH = 64;

const N = 2 ** 17;
const r = 8;
const p = 1;

// TODO: Логін — DoS-вектор. scrypt з N=2^17, r=8 бере 128 МБ на один хеш, а пул потоків має 4 потоки, тобто до 512 МБ
//      на одночасні логіни. Rate limiting при цьому немає. Параметри відповідають OWASP, але без ліміту на /auth/*
//      сервер легко «покласти».
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);

	const hash = await scryptAsync(
		password,
		salt,
		KEY_LENGTH,
		{
			N, r, p,
			maxmem: 256 * 1024 * 1024,
		},
	) as Buffer;

	return [
		'scrypt',
		N,
		r,
		p,
		salt.toString('hex'),
		hash.toString('hex'),
	].join('$');
}

export async function verifyPassword(
	password: string,
	storedPassword: string,
): Promise<boolean> {
	const [algorithm, n, rValue, pValue, saltHex, hashHex] = storedPassword.split('$');

	if (
		algorithm !== 'scrypt' ||
		!n ||
		!rValue ||
		!pValue ||
		!saltHex ||
		!hashHex
	) {
		return false;
	}

	const storedHash = Buffer.from(hashHex, 'hex');

	const hash = await scryptAsync(
		password,
		Buffer.from(saltHex, 'hex'),
		storedHash.length,
		{
			N: Number(n), r: Number(rValue), p: Number(pValue),
			maxmem: 256 * 1024 * 1024,
		},
	) as Buffer;

	if (hash.length !== storedHash.length) {
		return false;
	}

	return timingSafeEqual(hash, storedHash);
}
