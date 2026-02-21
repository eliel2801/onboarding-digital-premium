import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, Shield, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ManagedUser, UserRole } from '../types';
import { Card, Button, Input } from './ui';
import { useToast } from './ui';

export const AdminPanel = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setUsers(
        data.map((u: any) => ({
          id: u.user_id,
          email: u.email,
          role: u.role as UserRole,
          created_at: u.created_at,
        }))
      );
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast(`Usuario ${email} creado correctamente.`, 'success');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
          <Shield size={24} strokeWidth={1.5} />
          Gestionar Usuarios
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Crear cuentas y administrar accesos</p>
      </div>

      {/* Create user form */}
      <Card>
        <div className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus size={16} strokeWidth={1.5} />
            Crear Nuevo Usuario
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? (
                <><Loader2 size={16} className="animate-spin" /> Creando...</>
              ) : (
                <><UserPlus size={16} strokeWidth={1.5} /> Crear Usuario</>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* User list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">
          Usuarios Registrados ({users.length})
        </h2>
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 font-semibold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Calendar size={10} strokeWidth={1.5} />
                        {new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      user.role === 'admin'
                        ? 'bg-amber-950/30 text-amber-400 border-amber-800'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
