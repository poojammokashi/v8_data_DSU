import { useNavigate } from 'react-router-dom';
import {
	HiOutlineUser,
	HiOutlineCog6Tooth,
	HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import Dropdown, {
	DropdownItem,
	DropdownDivider,
} from '@components/ui/Dropdown';
import Avatar from '@components/ui/Avatar';
import { useAuthStore } from '@store/authStore';
import { ROLE_LABELS } from '@config/constants';

export default function UserMenu() {
	const navigate = useNavigate();
	const { user, logout } = useAuthStore();

	function handleLogout() {
		logout();
		navigate('/login');
	}

	return (
		<Dropdown
			align='right'
			trigger={
				<button className='flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface-subtle transition-colors'>
					<Avatar src={user?.avatarUrl} name={user?.name} size='sm' />
					<span className='hidden md:block text-left'>
						<span className='block text-sm font-medium text-ink leading-tight'>
							{user?.name || 'User'}
						</span>
						<span className='block text-2xs text-ink-muted leading-tight'>
							{/* {ROLE_LABELS[user?.role] || 'Viewer'} */}
							{ROLE_LABELS[user?.role?.name] || 'Viewer'}
						</span>
					</span>
				</button>
			}
			className='w-56'
		>
			<DropdownItem icon={HiOutlineUser} onClick={() => navigate('/profile')}>
				My Profile
			</DropdownItem>
			<DropdownItem
				icon={HiOutlineCog6Tooth}
				onClick={() => navigate('/settings')}
			>
				Settings
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem
				icon={HiOutlineArrowRightOnRectangle}
				onClick={handleLogout}
				danger
			>
				Sign out
			</DropdownItem>
		</Dropdown>
	);
}
