import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from './users.service'
import { User } from './user.entity'

describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email ===email);
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = ({ id: Math.floor(Math.random() * 999999), email, password } as User);
        users.push(user); 
        return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf')

    expect(user.password).not.toEqual('asdf')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { id: 1, email: 'test@test.com', password: 'abc' } as User,
    //   ])
    // console.log(fakeUsersService)
    await service.signup('test@test.com', 'password')

    try {
      await service.signup('test@test.com', 'password')
    } catch (error) {
      const { message, statusCode } = error.response
      expect(statusCode).toBe(400)
      expect(message).toBe('email in use')
    }
  })

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('asdflkj@asdlfkj.com', 'passdflkj')
    } catch (error) {
      const { statusCode } = error.response
      expect(statusCode).toBe(404)
      expect(error.message).toBe('user not found')
    }
  })

  it('throws if an invalid password is provided', async () => {
    await service.signup('laskdjf@alskdfj.com', 'password');
    try {
      await service.signin('laskdjf@alskdfj.com', 'laksdlfkj');
    } catch (error) {
      const { statusCode } = error.response
      expect(statusCode).toBe(400)
      expect(error.message).toBe('bad password')
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'pazzwoarrd')

      const user = await service.signin('asdf@asdf.com', 'pazzwoarrd');
      expect(user).toBeDefined();
    
  })
})
