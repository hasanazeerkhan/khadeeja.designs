import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Only POST allowed" })
  }

  const body = req.body || {}
  const name = body.name || ""
  const email = body.email || ""
  const message = body.message || ""
  const _gotcha = body._gotcha || ""

  if (_gotcha) return res.status(200).json({ ok: true }) // spam bot

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, message: "Missing fields" })
  }

  console.log("New contact submission:", { name, email, message })

  // TODO: Add SendGrid or email service integration here.

  return res.status(200).json({ ok: true, message: "Received" })
}
