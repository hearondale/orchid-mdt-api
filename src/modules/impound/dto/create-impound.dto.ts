export class CreateImpoundDto {
  plate!: string;
  make!: string;
  model!: string;
  color!: string;
  ownerName?: string;
  reason?: string;
  price!: number;
  releaseDate!: string; // ISO string; service converts to Date
  issuedById?: number; // set by controller from req.user.id
}
