import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, Shield, Calendar, Ban, CheckCircle, ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ManagedUser, UserRole } from '../types';
import { Card, Button, Input } from './ui';
import { useToast } from './ui';

export const AdminPanel = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);

    // Fetch roles from user_roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (rolesData && !rolesError) {
      // Fetch ban status via edge function
      const { data: banData } = await supabase.functions.invoke('create-user', {
        body: { action: 'list-ban-status', user_ids: rolesData.map((u: any) => u.user_id) },
      });

      const banMap: Record<string, boolean> = {};
      if (banData?.users) {
        banData.users.forEach((u: any) => { banMap[u.id] = u.is_banned; });
      }

      setUsers(
        rolesData.map((u: any) => ({
          id: u.user_id,
          email: u.email,
          role: u.role as UserRole,
          created_at: u.created_at,
          is_banned: banMap[u.user_id] || false,
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
        body: { action: 'create', email, password, role: selectedRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast(`Usuario ${email} creado como ${selectedRole}.`, 'success');
      setEmail('');
      setPassword('');
      setSelectedRole('user');
      fetchUsers();
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (user: ManagedUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setActionLoading(`role-${user.id}`);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { action: 'update-role', user_id: user.id, role: newRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast(`${user.email} ahora es ${newRole}.`, 'success');
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = async (user: ManagedUser) => {
    const action = user.is_banned ? 'unban-user' : 'ban-user';
    setActionLoading(`ban-${user.id}`);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { action, user_id: user.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u));
      toast(
        user.is_banned
          ? `${user.email} reactivado.`
          : `${user.email} desactivado.`,
        'success'
      );
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Get current admin's user id to prevent self-actions
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

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
        <p className="text-neutral-500 text-sm mt-1">Crear cuentas, cambiar roles y gestionar accesos</p>
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
              autoComplete="off"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">Rol</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedRole === 'user'
                      ? 'bg-white text-neutral-900 border-white'
                      : 'bg-neutral-800/60 text-neutral-400 border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-neutral-800/60 text-neutral-400 border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  Administrador
                </button>
              </div>
            </div>
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? (
                <><Loader2 size={16} className="animate-spin" /> Creando...</>
              ) : (
                <><UserPlus size={16} strokeWidth={1.5} /> Crear {selectedRole === 'admin' ? 'Admin' : 'Usuario'}</>
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
            {users.map((user) => {
              const isSelf = user.id === currentUserId;

              return (
                <Card key={user.id}>
                  <div className="p-4 space-y-3">
                    {/* User info row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm ${
                          user.is_banned
                            ? 'bg-red-950/50 text-red-400'
                            : 'bg-neutral-950 text-white'
                        }`}>
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${user.is_banned ? 'text-neutral-500 line-through' : 'text-white'}`}>
                            {user.email}
                            {isSelf && <span className="text-neutral-600 text-[10px] ml-2 no-underline">(tú)</span>}
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <Calendar size={10} strokeWidth={1.5} />
                            {new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Role badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            user.is_banned
                              ? 'bg-red-950/30 text-red-400 border-red-800'
                              : user.role === 'admin'
                                ? 'bg-amber-950/30 text-amber-400 border-amber-800'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {user.is_banned ? 'Desactivado' : user.role}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (not for self) */}
                    {!isSelf && (
                      <div className="flex gap-2 pt-1 border-t border-neutral-800/50">
                        {/* Toggle role */}
                        <button
                          onClick={() => handleToggleRole(user)}
                          disabled={actionLoading === `role-${user.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                          {actionLoading === `role-${user.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ArrowUpDown size={12} strokeWidth={1.5} />
                          )}
                          {user.role === 'admin' ? 'Hacer Usuario' : 'Hacer Admin'}
                        </button>

                        {/* Toggle ban */}
                        <button
                          onClick={() => handleToggleBan(user)}
                          disabled={actionLoading === `ban-${user.id}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50 ${
                            user.is_banned
                              ? 'text-emerald-400 hover:bg-emerald-950/30'
                              : 'text-red-400 hover:bg-red-950/30'
                          }`}
                        >
                          {actionLoading === `ban-${user.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : user.is_banned ? (
                            <CheckCircle size={12} strokeWidth={1.5} />
                          ) : (
                            <Ban size={12} strokeWidth={1.5} />
                          )}
                          {user.is_banned ? 'Reactivar' : 'Desactivar'}
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
