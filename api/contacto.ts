import type { VercelRequest, VercelResponse } from '@vercel/node';

type ContactPayload = {
  nombre: string;
  correo: string;
  telefono: string;
  empresa: string;
  mensaje: string;
  origen: string;
  website?: string;
};

const MAX_LENGTHS = {
  nombre: 120,
  correo: 254,
  telefono: 40,
  empresa: 160,
  mensaje: 3000,
  origen: 160,
} as const;

const MIN_LENGTHS: Partial<Record<keyof ContactPayload, number>> = {
  nombre: 2,
  telefono: 7,
  empresa: 2,
  mensaje: 10,
  origen: 2,
};

const REQUIRED: Array<keyof ContactPayload> = [
  'nombre',
  'correo',
  'telefono',
  'empresa',
  'mensaje',
  'origen',
];

const isText = (value: unknown): value is string => typeof value === 'string';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método no permitido.' });
    return;
  }

  const body = req.body as unknown;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ success: false, message: 'El cuerpo de la solicitud no es válido.' });
    return;
  }

  const contactBody = body as Partial<ContactPayload>;

  // Un honeypot lleno indica un envío automatizado y no se reenvía.
  if (isText(contactBody.website) && contactBody.website.trim() !== '') {
    res.status(400).json({ success: false, message: 'Solicitud no válida.' });
    return;
  }

  for (const field of REQUIRED) {
    if (!isText(contactBody[field]) || contactBody[field].trim().length === 0) {
      res.status(400).json({ success: false, message: `El campo ${field} es obligatorio.` });
      return;
    }
  }

  const contact: ContactPayload = {
    nombre: contactBody.nombre!.trim(),
    correo: contactBody.correo!.trim().toLowerCase(),
    telefono: contactBody.telefono!.trim(),
    empresa: contactBody.empresa!.trim(),
    mensaje: contactBody.mensaje!.trim(),
    origen: contactBody.origen!.trim(),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.correo)) {
    res.status(400).json({ success: false, message: 'El formato del correo electrónico no es válido.' });
    return;
  }

  for (const [field, minimum] of Object.entries(MIN_LENGTHS)) {
    const value = contact[field as keyof ContactPayload];
    if (typeof value !== 'string' || value.length < minimum) {
      res.status(400).json({ success: false, message: `El campo ${field} es demasiado corto.` });
      return;
    }
  }

  for (const [field, maximum] of Object.entries(MAX_LENGTHS)) {
    const value = contact[field as keyof ContactPayload];
    if (typeof value === 'string' && value.length > maximum) {
      res.status(400).json({ success: false, message: `El campo ${field} excede la longitud permitida.` });
      return;
    }
  }

  const powerAutomateUrl = process.env.POWER_AUTOMATE_URL;
  if (!powerAutomateUrl) {
    console.error('POWER_AUTOMATE_URL no está configurada.');
    res.status(500).json({ success: false, message: 'El servicio de contacto no está disponible.' });
    return;
  }

  try {
    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      console.error('Power Automate respondió con un error:', response.status);
      res.status(502).json({ success: false, message: 'No fue posible procesar la solicitud.' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error inesperado en la API de contacto:', error);
    res.status(500).json({ success: false, message: 'Ocurrió un error al enviar el formulario.' });
  }
}
