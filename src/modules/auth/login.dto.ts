export type LoginDTO = {
	accessToken: string;
};

export function toLoginDTO(accessToken: string): LoginDTO {
	return { accessToken };
}


