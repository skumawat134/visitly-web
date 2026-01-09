import React, { useState } from "react";
interface LoginFormState {
  email: string;
  password: string;
}
const Login: React.FC = () => {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // :small_blue_diamond: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Login Success:", form);
      alert("Login successful!");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 >Loaded From Auth MFE</h2>
        <h3 style={styles.title}>Login</h3>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.field}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
export default Login;
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4F6F8",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    padding: 24,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16,
  },
  input: {
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 10,
    fontSize: 16,
    background: "#1976D2",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
};