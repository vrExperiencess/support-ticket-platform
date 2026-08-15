import { DataSource } from "typeorm";

import { ClientEntity } from "../../../modules/clients/entities/client.entity";

export const CLIENT_IDS = {
  ACME: "40000000-0000-4000-8000-000000000001",
  NOVATECH: "40000000-0000-4000-8000-000000000002",
  ANDES: "40000000-0000-4000-8000-000000000003",
  HORIZONTE: "40000000-0000-4000-8000-000000000004",
  PIXEL: "40000000-0000-4000-8000-000000000005",
} as const;

export async function seedClients(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(ClientEntity);

  const clients = [
    {
      id: CLIENT_IDS.ACME,
      name: "Acme Industries",
      email: "support@acme.local",
      phone: "+57 300 100 1001",
      companyName: "Acme Industries S.A.S.",
      isActive: true,
    },
    {
      id: CLIENT_IDS.NOVATECH,
      name: "NovaTech Solutions",
      email: "contact@novatech.local",
      phone: "+57 300 100 1002",
      companyName: "NovaTech Solutions S.A.S.",
      isActive: true,
    },
    {
      id: CLIENT_IDS.ANDES,
      name: "Andes Logistics",
      email: "support@andes.local",
      phone: "+57 300 100 1003",
      companyName: "Andes Logistics S.A.S.",
      isActive: true,
    },
    {
      id: CLIENT_IDS.HORIZONTE,
      name: "Horizonte Retail",
      email: "operations@horizonte.local",
      phone: "+57 300 100 1004",
      companyName: "Horizonte Retail S.A.S.",
      isActive: true,
    },
    {
      id: CLIENT_IDS.PIXEL,
      name: "Pixel Labs",
      email: "hello@pixel.local",
      phone: "+57 300 100 1005",
      companyName: "Pixel Labs S.A.S.",
      isActive: true,
    },
  ];

  await repository.upsert(clients, ["id"]);

  console.log("  ✓ Clients seeded");
}