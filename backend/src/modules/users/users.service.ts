// src/modules/users/users.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmailWithRole(
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
      relations: {
        role: true,
      },
    });
  }

  async findByIdWithRole(
    id: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        role: true,
      },
    });
  }
}