"use server";

export async function subscribePlan(formData: FormData) {
  try {

    const name = formData.get("name");
    const email = formData.get("email");
    const plan = formData.get("plan");
    const card = formData.get("card");
    const cvv = formData.get("cvv");
    const address = formData.get("address");

    console.log("----- FORM DATA -----");
    console.log(name, email, plan, card, cvv, address);

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const TABLE = process.env.AIRTABLE_TABLE_NAME;

    console.log("----- ENV VARIABLES -----");
    console.log("BASE_ID:", BASE_ID);
    console.log("API_KEY exists:", API_KEY ? "YES" : "NO");

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}`;

    console.log("----- AIRTABLE URL -----");
    console.log(url);

    const body = {
      records: [
        {
          fields: {
            Name: name,
            Email: email,
            Plan: plan,
            Card: card,
            CVV: cvv,
            Address: address,
          },
        },
      ],
    };

    console.log("----- REQUEST BODY -----");
    console.log(JSON.stringify(body, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log("----- RESPONSE STATUS -----");
    console.log(res.status);

    console.log("----- AIRTABLE RESPONSE -----");
    console.log(data);

    if (!res.ok) {
      throw new Error(data?.error?.message || "Failed to subscribe");
    }

    console.log("Subscription Added Successfully");

  } catch (error) {

    console.error("----- FULL ERROR -----");
    console.error(error);

    throw new Error("Subscription failed");

  }
}