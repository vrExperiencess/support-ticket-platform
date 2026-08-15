import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  InjectRepository,
} from "@nestjs/typeorm";

import {
  Brackets,
  QueryFailedError,
  Repository,
} from "typeorm";

import {
  hash,
} from "bcryptjs";

import type {
  AuthenticatedUser,
} from "../auth/interfaces/authenticated-user.interface";

import {
  RoleEntity,
} from "../roles/entities/role.entity";

import {
  TicketEntity,
} from "../tickets/entities/ticket.entity";

import {
  TicketStatusCode,
} from "../tickets/enums/ticket.enums";

import {
  CreateUserDto,
} from "./dto/create-user.dto";

import {
  UpdateUserDto,
} from "./dto/update-user.dto";

import {
  UserFilterDto,
  UserSortBy,
  UserSortOrder,
} from "./dto/user-filter.dto";

import {
  PaginatedUsersResponseDto,
  RoleOptionResponseDto,
  UserDetailResponseDto,
  UserListItemResponseDto,
} from "./dto/user-response.dto";

import {
  UserEntity,
} from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(
      UserEntity,
    )
    private readonly userRepository:
      Repository<UserEntity>,

    @InjectRepository(
      RoleEntity,
    )
    private readonly roleRepository:
      Repository<RoleEntity>,

    @InjectRepository(
      TicketEntity,
    )
    private readonly ticketRepository:
      Repository<TicketEntity>,
  ) {}

  /*
   * ============================================================
   * METHODS USED BY AUTH
   * ============================================================
   */

  async findByEmail(
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder(
        "user",
      )
      .innerJoinAndSelect(
        "user.role",
        "role",
      )
      .where(
        "LOWER(user.email) = LOWER(:email)",
        {
          email:
            email.trim(),
        },
      )
      .getOne();
  }

  /**
   * Alias por compatibilidad con cualquier AuthService
   * que ya utilice este nombre.
   */
  async findByEmailWithRole(
    email: string,
  ): Promise<UserEntity | null> {
    return this.findByEmail(
      email,
    );
  }

  async findById(
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

  async findByIdWithRole(
    id: string,
  ): Promise<UserEntity | null> {
    return this.findById(
      id,
    );
  }

  async findActiveById(
    id: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        id,
        isActive: true,
      },

      relations: {
        role: true,
      },
    });
  }

  /*
   * ============================================================
   * METHODS USED BY TICKETS
   * ============================================================
   */

  async findActiveSupportAgentById(
    id: string,
  ): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder(
        "user",
      )
      .innerJoinAndSelect(
        "user.role",
        "role",
      )
      .where(
        "user.id = :id",
        {
          id,
        },
      )
      .andWhere(
        "user.isActive = true",
      )
      .andWhere(
        "role.code = :roleCode",
        {
          roleCode:
            "SUPPORT_AGENT",
        },
      )
      .getOne();
  }

  async findActiveSupportAgents(): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder(
        "user",
      )
      .innerJoinAndSelect(
        "user.role",
        "role",
      )
      .where(
        "user.isActive = true",
      )
      .andWhere(
        "role.code = :roleCode",
        {
          roleCode:
            "SUPPORT_AGENT",
        },
      )
      .orderBy(
        "user.name",
        "ASC",
      )
      .getMany();
  }

  /**
   * Será útil posteriormente para cumplir:
   *
   * Admin puede asignar tickets a cualquier usuario.
   */
  async findActiveUserById(
    id: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        id,
        isActive: true,
      },

      relations: {
        role: true,
      },
    });
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: {
        isActive: true,
      },

      relations: {
        role: true,
      },

      order: {
        name: "ASC",
      },
    });
  }

  /*
   * ============================================================
   * ADMIN - LIST USERS
   * ============================================================
   */

  async findAll(
    filters:
      UserFilterDto,
  ): Promise<PaginatedUsersResponseDto> {
    const query =
      this.userRepository
        .createQueryBuilder(
          "user",
        )
        .innerJoinAndSelect(
          "user.role",
          "role",
        );

    if (
      filters.search?.trim()
    ) {
      const search =
        `%${filters.search.trim()}%`;

      query.andWhere(
        new Brackets(
          (qb) => {
            qb.where(
              "user.name ILIKE :search",
              {
                search,
              },
            ).orWhere(
              "user.email ILIKE :search",
              {
                search,
              },
            );
          },
        ),
      );
    }

    if (
      filters.role
    ) {
      query.andWhere(
        "role.code = :roleCode",
        {
          roleCode:
            filters.role,
        },
      );
    }

    if (
      filters.isActive !==
      undefined
    ) {
      query.andWhere(
        "user.isActive = :isActive",
        {
          isActive:
            filters.isActive,
        },
      );
    }

    const sortColumns:
      Record<
        UserSortBy,
        string
      > = {
      [UserSortBy.NAME]:
        "user.name",

      [UserSortBy.EMAIL]:
        "user.email",

      [UserSortBy.CREATED_AT]:
        "user.createdAt",

      [UserSortBy.UPDATED_AT]:
        "user.updatedAt",
    };

    query.orderBy(
      sortColumns[
        filters.sortBy
      ],

      filters.sortOrder ??
        UserSortOrder.ASC,
    );

    query
      .skip(
        (filters.page - 1) *
          filters.limit,
      )
      .take(
        filters.limit,
      );

    const [
      users,
      total,
    ] =
      await query.getManyAndCount();

    return {
      data:
        users.map(
          (
            user:
              UserEntity,
          ) =>
            this.mapUser(
              user,
            ),
        ),

      meta: {
        page:
          filters.page,

        limit:
          filters.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              filters.limit,
          ),
      },
    };
  }

  /*
   * ============================================================
   * ADMIN - DETAIL
   * ============================================================
   */

  async findOneForManagement(
    id: string,
  ): Promise<UserDetailResponseDto> {
    const user =
      await this.findRequiredUser(
        id,
      );

    const [
      activeAssignedTickets,
      resolvedLast30Days,
      overdueAssignedTickets,
      createdTickets,
    ] =
      await Promise.all([
        /*
         * OPEN + IN_PROGRESS actualmente asignados.
         */
        this.ticketRepository
          .createQueryBuilder(
            "ticket",
          )
          .innerJoin(
            "ticket.status",
            "status",
          )
          .where(
            "ticket.assignedToUserId = :userId",
            {
              userId:
                user.id,
            },
          )
          .andWhere(
            "status.code IN (:...activeStatuses)",
            {
              activeStatuses: [
                TicketStatusCode.OPEN,
                TicketStatusCode.IN_PROGRESS,
              ],
            },
          )
          .getCount(),

        /*
         * Tickets efectivamente resueltos por este usuario
         * durante los últimos 30 días.
         */
        this.ticketRepository
          .createQueryBuilder(
            "ticket",
          )
          .where(
            "ticket.resolvedByUserId = :userId",
            {
              userId:
                user.id,
            },
          )
          .andWhere(
            "ticket.resolvedAt >= NOW() - INTERVAL '30 days'",
          )
          .getCount(),

        /*
         * Tickets actualmente asignados cuya fecha límite
         * ya venció.
         */
        this.ticketRepository
          .createQueryBuilder(
            "ticket",
          )
          .innerJoin(
            "ticket.status",
            "status",
          )
          .where(
            "ticket.assignedToUserId = :userId",
            {
              userId:
                user.id,
            },
          )
          .andWhere(
            "ticket.dueAt < NOW()",
          )
          .andWhere(
            "status.code IN (:...activeStatuses)",
            {
              activeStatuses: [
                TicketStatusCode.OPEN,
                TicketStatusCode.IN_PROGRESS,
              ],
            },
          )
          .getCount(),

        /*
         * Tickets creados por el usuario.
         */
        this.ticketRepository.count({
          where: {
            createdByUserId:
              user.id,
          },
        }),
      ]);

    return {
      ...this.mapUser(
        user,
      ),

      stats: {
        activeAssignedTickets,

        resolvedLast30Days,

        overdueAssignedTickets,

        createdTickets,
      },
    };
  }

  /*
   * ============================================================
   * ROLES CATALOG
   * ============================================================
   */

  async getRoleOptions(): Promise<RoleOptionResponseDto[]> {
    const roles =
      await this.roleRepository.find({
        order: {
          name:
            "ASC",
        },
      });

    return roles.map(
      (
        role:
          RoleEntity,
      ) => ({
        id:
          role.id,

        code:
          role.code,

        name:
          role.name,
      }),
    );
  }

  /*
   * ============================================================
   * CREATE
   * ============================================================
   */

  async create(
    dto:
      CreateUserDto,
  ): Promise<UserDetailResponseDto> {
    const email =
      this.normalizeEmail(
        dto.email,
      );

    const existingUser =
      await this.userRepository.findOne({
        where: {
          email,
        },
      });

    if (
      existingUser
    ) {
      throw new ConflictException(
        "A user with this email already exists.",
      );
    }

    const role =
      await this.roleRepository.findOne({
        where: {
          id:
            dto.roleId,
        },
      });

    if (!role) {
      throw new BadRequestException(
        "The selected role does not exist.",
      );
    }

    const passwordHash =
      await hash(
        dto.password,
        12,
      );

    const user =
      this.userRepository.create({
        name:
          dto.name.trim(),

        email,

        passwordHash,

        roleId:
          role.id,

        isActive:
          dto.isActive,
      });

    try {
      const savedUser =
        await this.userRepository.save(
          user,
        );

      return this.findOneForManagement(
        savedUser.id,
      );
    } catch (
      error: unknown
    ) {
      if (
        this.isUniqueViolation(
          error,
        )
      ) {
        throw new ConflictException(
          "A user with this email already exists.",
        );
      }

      throw error;
    }
  }

  /*
   * ============================================================
   * UPDATE
   * ============================================================
   */

  async update(
    id: string,
    dto:
      UpdateUserDto,
    currentUser:
      AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const user =
      await this.findRequiredUser(
        id,
      );

    /*
     * Protegemos al usuario autenticado de bloquear
     * accidentalmente su propia sesión administrativa.
     */
    if (
      user.id ===
      currentUser.id
    ) {
      if (
        dto.isActive ===
        false
      ) {
        throw new ForbiddenException(
          "You cannot deactivate your own user account.",
        );
      }

      if (
        dto.roleId !==
          undefined &&
        dto.roleId !==
          user.roleId
      ) {
        throw new ForbiddenException(
          "You cannot change your own role.",
        );
      }
    }

    if (
      dto.email !==
      undefined
    ) {
      const email =
        this.normalizeEmail(
          dto.email,
        );

      const emailOwner =
        await this.userRepository
          .createQueryBuilder(
            "user",
          )
          .where(
            "LOWER(user.email) = LOWER(:email)",
            {
              email,
            },
          )
          .andWhere(
            "user.id != :userId",
            {
              userId:
                user.id,
            },
          )
          .getOne();

      if (
        emailOwner
      ) {
        throw new ConflictException(
          "A user with this email already exists.",
        );
      }

      user.email =
        email;
    }

    if (
      dto.roleId !==
      undefined
    ) {
      const role =
        await this.roleRepository.findOne({
          where: {
            id:
              dto.roleId,
          },
        });

      if (!role) {
        throw new BadRequestException(
          "The selected role does not exist.",
        );
      }

      user.roleId =
        role.id;
    }

    if (
      dto.name !==
      undefined
    ) {
      user.name =
        dto.name.trim();
    }

    if (
      dto.isActive !==
      undefined
    ) {
      user.isActive =
        dto.isActive;
    }

    try {
      await this.userRepository.save(
        user,
      );
    } catch (
      error: unknown
    ) {
      if (
        this.isUniqueViolation(
          error,
        )
      ) {
        throw new ConflictException(
          "A user with this email already exists.",
        );
      }

      throw error;
    }

    return this.findOneForManagement(
      user.id,
    );
  }

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  private async findRequiredUser(
    id: string,
  ): Promise<UserEntity> {
    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },

        relations: {
          role:
            true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        "User not found.",
      );
    }

    return user;
  }

  private mapUser(
    user:
      UserEntity,
  ): UserListItemResponseDto {
    return {
      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      isActive:
        user.isActive,

      role: {
        id:
          user.role.id,

        code:
          user.role.code,

        name:
          user.role.name,
      },

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt,
    };
  }

  private normalizeEmail(
    email: string,
  ): string {
    return email
      .trim()
      .toLowerCase();
  }

  /**
   * Código PostgreSQL:
   *
   * 23505 = unique_violation
   */
  private isUniqueViolation(
    error: unknown,
  ): boolean {
    if (
      !(
        error instanceof
        QueryFailedError
      )
    ) {
      return false;
    }

    const driverError =
      error.driverError as
        | {
            code?: string;
          }
        | undefined;

    return (
      driverError?.code ===
      "23505"
    );
  }
}