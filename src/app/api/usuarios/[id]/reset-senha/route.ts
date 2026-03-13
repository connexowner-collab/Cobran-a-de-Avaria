import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getUsuarioById } from '@/lib/store';

/** Gera uma senha aleatória (letras + números, 12 caracteres). */
function gerarNovaSenha(): string {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  const numeros = '23456789';
  const todos = letras + numeros;
  let senha = '';
  for (let i = 0; i < 12; i++) {
    senha += todos[Math.floor(Math.random() * todos.length)];
  }
  return senha;
}

/**
 * Cria transporter SMTP a partir das variáveis de ambiente.
 * Configure: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
function createMailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function enviarEmailNovaSenha(
  destinatario: string,
  nome: string,
  novaSenha: string
): Promise<void> {
  const assunto = 'Portal do Cliente - Nova senha de acesso';
  const corpoTexto = `
Olá, ${nome},

Sua senha de acesso ao Portal do Cliente foi redefinida.

Nova senha: ${novaSenha}

Recomendamos alterar esta senha no primeiro acesso.

Em caso de dúvidas, entre em contato com o suporte.
  `.trim();

  const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'Portal do Cliente <noreply@localhost>';

  const transporter = createMailer();
  if (!transporter) {
    throw new Error(
      'Envio de e-mail não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS no .env (e opcionalmente SMTP_PORT, SMTP_SECURE, SMTP_FROM).'
    );
  }

  await transporter.sendMail({
    from,
    to: destinatario,
    subject: assunto,
    text: corpoTexto,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = getUsuarioById(id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const novaSenha = gerarNovaSenha();
    await enviarEmailNovaSenha(usuario.email, usuario.nome, novaSenha);

    return NextResponse.json({
      success: true,
      message: `E-mail com a nova senha foi enviado para ${usuario.email}.`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao enviar e-mail de redefinição de senha.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
