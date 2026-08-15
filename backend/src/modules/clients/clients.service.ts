import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ClientEntity } from "./entities/client.entity";

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async findActiveById(
    id: string,
  ): Promise<ClientEntity | null> {
    return this.clientRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findActiveClients(): Promise<ClientEntity[]> {
    return this.clientRepository.find({
      where: {
        isActive: true,
      },
      order: {
        name: "ASC",
      },
    });
  }
}