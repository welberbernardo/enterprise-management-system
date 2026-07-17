import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { UserPlus, Trash2, Mail, Phone } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/ui/Spinner';

interface CustomerContactsProps {
  customerId: string;
}

export function CustomerContacts({ customerId }: CustomerContactsProps) {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['customer-contacts', customerId],
    queryFn: () => customerService.getContacts(customerId),
  });

  const addMutation = useMutation({
    mutationFn: () => customerService.addContact(customerId, { name, email, phone, position, isPrimary: false }),
    onSuccess: () => {
      notify.success('Contact added');
      queryClient.invalidateQueries({ queryKey: ['customer-contacts', customerId] });
      setOpen(false);
      setName(''); setEmail(''); setPhone(''); setPosition('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (contactId: string) => customerService.removeContact(customerId, contactId),
    onSuccess: () => {
      notify.success('Contact removed');
      queryClient.invalidateQueries({ queryKey: ['customer-contacts', customerId] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setOpen(true)}>Add Contact</Button>
      </div>

      {!contacts || contacts.length === 0 ? (
        <EmptyState variant="users" title="No contacts" description="Add a contact person for this customer" />
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.isPrimary && <Badge variant="success" className="text-[10px]">Primary</Badge>}
                </div>
                {c.position && <p className="text-xs text-slate-400">{c.position}</p>}
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                </div>
              </div>
              <button onClick={() => removeMutation.mutate(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Contact" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => addMutation.mutate()} loading={addMutation.isPending}>Add</Button>
        </>}>
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
