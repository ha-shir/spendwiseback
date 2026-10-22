import { test, describe } from "node:test";
import assert from "node:assert";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("SpendWise Backend Unit & Verification Tests", () => {
  test("Password hashing and comparison with bcrypt", async () => {
    const password = "TestPassword@123";
    const hashed = await bcrypt.hash(password, 10);

    assert.ok(hashed, "Hashed password should exist");
    assert.notStrictEqual(hashed, password, "Hashed password should not equal raw password");

    const isMatch = await bcrypt.compare(password, hashed);
    assert.strictEqual(isMatch, true, "Bcrypt should verify correct password");

    const isWrong = await bcrypt.compare("WrongPassword", hashed);
    assert.strictEqual(isWrong, false, "Bcrypt should reject wrong password");
  });

  test("JWT token signing and verification", () => {
    const testSecret = "test_spendwise_secret_key_12345";
    const payload = { id: "60d0fe4f5311236168a109ca", usertype: "user" };

    const token = jwt.sign(payload, testSecret, { expiresIn: "1h" });
    assert.ok(token, "JWT token should be generated");

    const decoded = jwt.verify(token, testSecret);
    assert.strictEqual(decoded.id, payload.id, "Decoded user ID should match");
    assert.strictEqual(decoded.usertype, payload.usertype, "Decoded user type should match");

    assert.throws(() => {
      jwt.verify(token, "invalid_secret");
    }, /invalid signature/, "JWT should reject invalid secret");
  });

  test("Financial aggregation and savings logic", () => {
    const expenses = [
      { amount: 150.5, category: "Food" },
      { amount: 200, category: "Utilities" },
      { amount: 50, category: "Transport" }
    ];

    const incomes = [
      { amount: 1000, source: "Salary" },
      { amount: 250, source: "Freelance" }
    ];

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const netSavings = totalIncome - totalExpense;

    assert.strictEqual(totalExpense, 400.5, "Total expense calculation should be accurate");
    assert.strictEqual(totalIncome, 1250, "Total income calculation should be accurate");
    assert.strictEqual(netSavings, 849.5, "Net savings should be correct");
  });

  test("Monthly date boundary calculations", () => {
    const testMonth = "2026-10";
    const start = new Date(testMonth + "-01");
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    assert.strictEqual(start.getFullYear(), 2026);
    assert.strictEqual(start.getMonth(), 9); // 0-indexed October is 9
    assert.strictEqual(end.getMonth(), 10); // November is 10
  });
});
