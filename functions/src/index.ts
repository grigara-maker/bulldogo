import * as functions from "firebase-functions";
import axios from "axios";
import cors from "cors";

// Minimal functions index: only non-payment endpoints remain (GoPay removed)
const corsHandler = cors({ origin: true });

export const validateICO = functions.region("europe-west1").https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      let networkError = false;
      const raw =
        (req.method === "GET"
          ? (req.query.ico as string) || (req.query.ic as string) || ""
          : (req.body?.ico as string) || (req.body?.ic as string) || "") || "";
      const ico = (raw || "").toString().replace(/\D+/g, "").slice(0, 8);
      if (ico.length !== 8) {
        res.status(200).json({ ok: false, reason: "IČO musí mít 8 číslic." });
        return;
      }

      // Primární REST JSON API
      try {
        const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/v1/ekonomicke-subjekty/${ico}`;
        const ares = await axios.get(url, {
          timeout: 7000,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Bulldogo-Functions/1.0 (+https://bulldogo.cz)"
          }
        });
        const data: any = ares.data || {};
        const companyName =
          data.obchodniJmeno ||
          data.obchodni_jmeno ||
          data.obchodni_name ||
          data.obchodniJméno ||
          null;
        const seat = data.sidlo || data.sídlo || data.seat || null;
        if (companyName || data.ico || data.IC) {
          res.status(200).json({ ok: true, ico, name: companyName, seat });
          return;
        }
      } catch (err: any) {
        networkError = true;
      }

      // Fallback na staré XML API
      try {
        const urlXml1 = `https://wwwinfo.mfcr.cz/cgi-bin/ares/darv_bas.cgi?ico=${ico}`;
        const xmlRes1 = await axios.get<string>(urlXml1, {
          timeout: 8000,
          responseType: "text",
          headers: {
            "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Bulldogo-Functions/1.0 (+https://bulldogo.cz)"
          },
          transformResponse: [(d) => d],
        });
        let xml = xmlRes1.data || "";
        if (!xml || typeof xml !== "string" || xml.length < 50) {
          const urlXml2 = `https://wwwinfo.mfcr.cz/cgi-bin/ares/xar.cgi?ico=${ico}&jazyk=cz&xml=1`;
          const xmlRes2 = await axios.get<string>(urlXml2, {
            timeout: 8000,
            responseType: "text",
            headers: {
              "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
              "User-Agent": "Bulldogo-Functions/1.0 (+https://bulldogo.cz)"
            },
            transformResponse: [(d) => d],
          });
          xml = xmlRes2.data || "";
        }

        const icoMatch = xml.match(/<[^>]*ICO[^>]*>\s*([0-9]{8})\s*<\/[^>]*ICO[^>]*>/i);
        let name: string | null = null;
        const nameMatchOF = xml.match(/<[^>]*OF[^>]*>\s*([^<]+)\s*<\/[^>]*OF[^>]*>/i);
        const nameMatchObchodniFirma = xml.match(/<Obchodni[_ ]?firma[^>]*>\s*([^<]+)\s*<\/Obchodni[_ ]?firma[^>]*>/i);
        if (nameMatchOF && nameMatchOF[1]) name = nameMatchOF[1].trim();
        else if (nameMatchObchodniFirma && nameMatchObchodniFirma[1]) name = nameMatchObchodniFirma[1].trim();

        if (icoMatch && icoMatch[1]) {
          res.status(200).json({ ok: true, ico, name });
          return;
        }
      } catch (err: any) {
        networkError = true;
      }

      if (networkError) {
        res.status(200).json({ ok: false, reason: "ARES je dočasně nedostupný. Zkuste to později." });
        return;
      }
      res.status(200).json({ ok: false, reason: "Subjekt s tímto IČO nebyl nalezen." });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        res.status(200).json({ ok: false, reason: "Subjekt s tímto IČO nebyl nalezen." });
        return;
      }
      res.status(200).json({ ok: false, reason: "ARES je dočasně nedostupný. Zkuste to později." });
    }
  });
});

