import fetch from 'node-fetch';

describe('create user - no data', () => {
    it('should return 400 if no data is provided', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
        });

        expect(response.status).toBe(400);
    });
});

describe('create user - name too short', () => {
    it('should return 400 if name is too short (less than 3 characters)', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "ex", // Name too short
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(400);
    });
});

describe('user data - no user', () => {
    it('should return 404)', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "exdgdgdgdg", // Name too short
                email: "exampledfgdfg@example.com",
                password: "examplesd12345"
            }),
        });

        console.log(await response.json())
        expect(response.status).toBe(404);
    });
});

describe('create user - name too long', () => {
    it('should return 400 if name is too long (more than 30 characters)', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "supercalifragilisticexpialidocs", // Name too long
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(400);
    });
});

describe('create user - invalid email', () => {
    it('should return 400 if email format is invalid', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example",
                email: "invalid-email", // Invalid email format
                password: "example12345"
            }),
        });

        expect(response.status).toBe(400);
    });
});

describe('create user - password too short', () => {
    it('should return 400 if password is too short (less than 8 characters)', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example",
                email: "example@example.com",
                password: "short" // Password too short
            }),
        });

        expect(response.status).toBe(400);
    });
});

describe('create user - password too long', () => {
    it('should return 400 if password is too long (more than 30 characters)', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example",
                email: "example@example.com",
                password: "thispasswordiswaytoolong123ssssssssssssssssssss" // Password too long
            }),
        });

        expect(response.status).toBe(400);
    });
});

describe('create user - successful creation', () => {
    it('should return 200 and create user with valid data', async () => {
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example",
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(200);
    });
});


describe('create user - user already exists', () => {
    it('should return 409 if user with the same email or name already exists', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example", // Existing name or email
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(409); // Conflict
    });
});

describe('create user - user already exists', () => {
    it('should return 409 if user with the same email or name already exists', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example", // Existing name or email
                email: "example1@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(409); // Conflict
    });
});

describe('create user - user already exists', () => {
    it('should return 409 if user with the same email or name already exists', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example1", // Existing name or email
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(409); // Conflict
    });
});


describe('create user - user already exists', () => {
    it('should return 409 if user with the same email or name already exists', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "example1", // Existing name or email
                password: "example12345"
            }),
        });

        expect(response.status).toBe(400); // Conflict
    });
});

describe('create user - user already exists', () => {
    it('should return 409 if user with the same email or name already exists', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: "example@example.com",
                password: "example12345"
            }),
        });

        expect(response.status).toBe(400); // Conflict
    });
});



// USER GETTING 
describe('get user - no data', () => {
    it('should return 400 if no data specified', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            }
        });

        expect(response.status).toBe(400); // Conflict
    });
});

describe('get user - correct data', () => {
    it('should return 200', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "email": "example@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(200); // Conflict
    });
});

describe('get user - correct data only email', () => {
    it('should return 200', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": "example@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(200); // Conflict
    });
});

describe('get user - correct data only name', () => {
    it('should return 200', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(200); // Conflict
    });
});

describe('get user - wrong password', () => {
    it('should return 401', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "email": "example@example.com",
                "password": "example123452"
            })
        });

        expect(response.status).toBe(401);
    });
});

describe('get user - wrong password only name', () => {
    it('should return 401', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "password": "example123452"
            })
        });

        expect(response.status).toBe(401);
    });
});

describe('get user - correct data but wrong email', () => {

    it('should return 200', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "email": "example23@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(200); // Conflict
    });
});


describe('get user - correct data but wrong name', () => {

    it('should return 200', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "examplegsdgs",
                "email": "example@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(200); // Conflict
    });
});

describe('delete user - no data', () => {

    it('should return 400', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(response.status).toBe(400); // Conflict
    });
});

describe('delete user - wrong pass', () => {

    it('should return 401', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "email": "example@example.com",
                "password": "example1234562"
            })
        });

        expect(response.status).toBe(401); // Conflict
    });
});

describe('delete user - wrong pass only name', () => {

    it('should return 401', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "name": "example",
                "password": "example1234562"
            })
        });

        expect(response.status).toBe(401); // Conflict
    });
});

describe('delete user - wrong pass only name', () => {

    it('should return 401', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": "example@example.com",
                "password": "example1234562"
            })
        });

        expect(response.status).toBe(401); // Conflict
    });
});

describe('delete user - correct email', () => {

    it('should return 204', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": "example@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(204); // Conflict
    });
});

describe('get user - no user', () => {

    it('should return 400', async () => {
        // Assuming the user "example@example.com" already exists in the DB
        const response = await fetch("http://localhost:4001/api/v1/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": "example@example.com",
                "password": "example12345"
            })
        });

        expect(response.status).toBe(404); // Conflict
    });
});