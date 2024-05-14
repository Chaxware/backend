import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { dbInstance } from "../lib/db";
import { otps, users } from "../lib/schema";
import { nanoid, customRandom, random } from "nanoid";
import { Bindings } from "../lib/utils";



const auth = new Hono < { Bindings: Bindings }>();


auth.post("/", zValidator('json', z.object({
    email: z.string().email(),
})), async (c) => {
    // TODO: implement error handling when unique constraints and return an error.
    const db = dbInstance(c.env)
    const { email } = c.req.valid('json')

    const id = nanoid()
    await db.insert(users).values({
        id,
        email,
        username: nanoid(5),
    })

    const num = customRandom("0123456789", 6, random)();

    await db.insert(otps).values({
        userId: id,
        number: Number(num),
    })
    
    // TODO: Send user otp via email
    
    return c.json({
       message: "Email sent, check inbox" 
	});
});

export default auth;
