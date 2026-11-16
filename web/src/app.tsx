import { type FormEvent, type JSX, useState } from 'react';

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type Field = 'name' | 'email' | 'message';
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ['name', 'email', 'message'];

/** Mirrors `@MaxLength(1000)` on the API's CreateContactDto. */
const MESSAGE_MAX_LENGTH = 1000;

/** Counts characters the way validator.js `isLength` (behind `@MaxLength`) does. */
function messageLength(value: string): number {
  const presentationSequences = value.match(/[^\uFE0F\uFE0E][\uFE0F\uFE0E]/g) ?? [];
  const surrogatePairs = value.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) ?? [];
  return value.length - presentationSequences.length - surrogatePairs.length;
}

/** Maps class-validator messages ("name should not be empty") to their field. */
function toFieldErrors(messages: string[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const message of messages) {
    const field = FIELDS.find((f) => message.startsWith(`${f} `));
    if (field && !errors[field]) errors[field] = message;
  }
  return errors;
}

export function App(): JSX.Element {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    setSuccess(false);
    setFailure(null);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.status === 400) {
        const body: { message: string[] | string } = await res.json();
        setErrors(toFieldErrors([body.message].flat()));
        return;
      }
      if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
      setErrors({});
      setSuccess(true);
      form.reset();
    } catch {
      setFailure('Something went wrong. Please try again.');
    }
  }

  return (
    <main>
      <form onSubmit={onSubmit} onReset={() => setMessage('')} noValidate>
        <h1>Contact us</h1>
        <p className="lead">Send us a message and we will get back to you.</p>
        {success && <p role="status" className="success">Thanks! Your message was sent.</p>}
        {failure && <p role="alert" className="error">{failure}</p>}
        <label>
          Name
          <input name="name" type="text" autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input name="email" type="text" autoComplete="email" aria-invalid={!!errors.email} />
          {errors.email && <span className="error">{errors.email}</span>}
        </label>
        <label>
          Message
          <textarea
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby="message-counter"
          />
          {errors.message && <span className="error">{errors.message}</span>}
        </label>
        <span
          id="message-counter"
          className={messageLength(message) > MESSAGE_MAX_LENGTH ? 'counter over' : 'counter'}
        >
          {messageLength(message)} / {MESSAGE_MAX_LENGTH}
        </span>
        <button type="submit">Send message</button>
      </form>
    </main>
  );
}
