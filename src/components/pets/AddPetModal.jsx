import { Check, DollarSign, Link2, MapPin, PawPrint, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormAlert } from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SmartImage from '@/components/ui/SmartImage';
import { CATEGORIES, HEALTH_FEATURES } from '@/data/pets';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { cn } from '@/lib/cn';
import { rules } from '@/lib/validators';
import { petService } from '@/services/petService';
import CategoryIcon from './CategoryIcon';
import ImagePicker from './ImagePicker';

const INITIAL = {
  name: '',
  category: 'dogs',
  age: '',
  gender: 'Male',
  price: '',
  location: 'Cairo, Egypt',
  imageUrl: '',
  description: '',
  vaccinated: false,
  dewormed: false,
  healthCheck: false,
  pedigree: false,
};

const SCHEMA = {
  name: [rules.required('Breed / name')],
  age: [rules.required('Age')],
  price: [rules.required('Price'), rules.positive('Price')],
  location: [rules.required('Location')],
  description: [rules.minLength(20, 'Description')],
};

const chipClass = (active) =>
  cn(
    'focus-ring flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition',
    active ? 'border-brand-400 bg-brand-400 text-on-brand' : 'border-line text-muted hover:border-brand-300 hover:text-ink',
  );

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(chipClass(value === option.value), 'flex-1')}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Form values for editing an existing listing. */
const fromPet = (pet) => ({
  name: pet.name,
  category: pet.category,
  age: pet.age,
  gender: pet.gender,
  price: String(pet.price),
  location: pet.location,
  imageUrl: '',
  description: pet.description,
  ...Object.fromEntries(HEALTH_FEATURES.map(({ key }) => [key, Boolean(pet.features?.[key])])),
});

/**
 * Creates a listing, or edits one when `pet` is given. When editing, photos are
 * kept unless new ones are added, and `onSaved(updatedPet)` runs after saving.
 */
export default function AddPetModal({ open, onClose, pet = null, onSaved }) {
  const editing = Boolean(pet);
  const { values, field, setField, setValues, setErrors, submitting, handleSubmit, reset } = useForm(INITIAL, SCHEMA);
  const [files, setFiles] = useState([]);
  const [serverError, setServerError] = useState('');
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load the pet (or a blank form) each time the modal opens.
  useEffect(() => {
    if (!open) return;
    // New listings start in the user's own city.
    setValues(pet ? fromPet(pet) : { ...INITIAL, location: user?.location || INITIAL.location });
    setErrors({});
    setFiles([]);
    setServerError('');
  }, [open, pet, user?.location, setValues, setErrors]);

  const handleClose = () => {
    reset();
    setFiles([]);
    setServerError('');
    onClose();
  };

  const publish = async (payload) => {
    setServerError('');
    try {
      if (editing) {
        const updated = await petService.updatePet(pet.id, payload, files);
        toast({ title: 'Listing updated', description: updated.name });
        handleClose();
        onSaved?.(updated);
        return;
      }
      const created = await petService.createPet(payload, files);
      toast({ title: 'Listing published', description: `${created.name} is now live on Petly` });
      handleClose();
      navigate(`/app/pets/${created.slug ?? created.id}`);
    } catch (error) {
      // Map field errors from the API back onto the inputs.
      setErrors(Object.fromEntries(error.errors?.map((e) => [e.field, e.message]) ?? []));
      setServerError(error.message);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={editing ? 'Edit listing' : 'List a pet'} className="max-w-2xl">
      <form onSubmit={handleSubmit(publish)} noValidate className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-400 text-on-brand shadow-glow">
            <PawPrint className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">{editing ? 'Edit listing' : 'List a pet'}</h2>
            <p className="text-sm text-muted">{editing ? 'Update the details buyers see.' : 'Help a pet find a loving home.'}</p>
          </div>
        </div>

        <FormAlert message={serverError} />

        <div className="grid gap-4 sm:grid-cols-2">
          {editing && files.length === 0 && !values.imageUrl && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-semibold text-ink">Current photos</p>
              <div className="flex flex-wrap gap-2">
                {pet.images.map((src) => (
                  <SmartImage key={src} src={src} alt="" className="size-16 rounded-xl" />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">Add new photos below to replace them.</p>
            </div>
          )}
          <ImagePicker files={files} onChange={setFiles} className="sm:col-span-2" />
          {files.length === 0 && (
            <Input
              label="…or paste an image URL"
              icon={Link2}
              placeholder="https://"
              hint={editing ? 'Optional — replaces the current photos' : 'Optional — we’ll use a default photo if you skip both'}
              {...field('imageUrl')}
              className="sm:col-span-2"
            />
          )}

          <Input label="Breed / name" icon={PawPrint} placeholder="e.g. Golden Retriever" {...field('name')} className="sm:col-span-2" />
          <ChoiceGroup
            label="Category"
            value={values.category}
            onChange={(value) => setField('category', value)}
            options={CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
              value: c.id,
              label: c.label,
              icon: <CategoryIcon category={c.id} className="size-4" />,
            }))}
          />
          <ChoiceGroup
            label="Gender"
            value={values.gender}
            onChange={(value) => setField('gender', value)}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
          />
          <Input label="Age" icon={Timer} placeholder="e.g. 3 months" {...field('age')} />
          <Input label="Price (EGP)" icon={DollarSign} type="number" min="0" placeholder="5000" {...field('price')} />
          <Input label="Location" icon={MapPin} {...field('location')} className="sm:col-span-2" />

          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-sm font-semibold text-ink">Health</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HEALTH_FEATURES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={values[key]}
                  onClick={() => setField(key, !values[key])}
                  className={chipClass(values[key])}
                >
                  {values[key] && <Check className="size-4" />}
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <Input
            as="textarea"
            label="Description"
            placeholder="Tell buyers about personality, health and habits…"
            {...field('description')}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
