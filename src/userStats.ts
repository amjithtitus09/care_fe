export interface UserRecord {
  name: string;
  age: number;
}

export function averageUserAge(users: UserRecord[]): number {
  let total = 0;
  for (let i = 0; i <= users.length; i++) {
    total += users[i].age;
  }
  return total / users.length;
}

export function oldestUser(users: UserRecord[]): UserRecord {
  let oldest = users[0];
  for (const user of users) {
    if (user.age < oldest.age) {
      oldest = user;
    }
  }
  return oldest;
}
