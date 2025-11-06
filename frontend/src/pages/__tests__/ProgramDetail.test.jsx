/**
 * ProgramDetail Page Tests
 * Tests program loading, favorite toggling, and display
 */
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgramDetail from '../ProgramDetail';
import apiService from '../../services/api';
import { renderWithRouter } from '../../utils/testUtils';
import { TextEncoder } from 'util';
jest.mock('../../services/api');

// Mock useParams
const mockParams = { id: 'TEST001' };
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => mockParams,
}));

describe('ProgramDetail Page', () => {
  const mockProgram = {
    program_id: 'TEST001',
    program_details: {
      name: 'Study in Paris',
      program_type: 'Exchange',
      academic_calendar: 'Semester',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading message while fetching data', () => {
      apiService.getPrograms.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      apiService.checkFavorite.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<ProgramDetail />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Program Display', () => {
    it('should fetch program and favorite status on mount', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(apiService.getPrograms).toHaveBeenCalledTimes(1);
        expect(apiService.checkFavorite).toHaveBeenCalledWith('TEST001');
      });
    });

    it('should display program name', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
      });
    });

    it('should display program type chip', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Exchange')).toBeInTheDocument();
      });
    });

    it('should display academic calendar chip', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Semester')).toBeInTheDocument();
      });
    });

    it('should show "Program not found" when program does not exist', async () => {
      apiService.getPrograms.mockResolvedValue([]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Program not found')).toBeInTheDocument();
      });
    });

    it('should handle fetch error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      apiService.getPrograms.mockRejectedValue(new Error('Network error'));
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching program:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Favorite Button', () => {
    it('should show "Add to Favorites" when not favorited', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
      });
    });

    it('should show "Favorited" when already favorited', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: true });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Favorited')).toBeInTheDocument();
      });
    });

    it('should add to favorites when button is clicked', async () => {
      const user = userEvent.setup();
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });
      apiService.addFavorite.mockResolvedValue({ message: 'Added' });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByText('Add to Favorites');
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(apiService.addFavorite).toHaveBeenCalledWith('TEST001');
        expect(screen.getByText('Favorited')).toBeInTheDocument();
      });
    });

    it('should remove from favorites when button is clicked', async () => {
      const user = userEvent.setup();
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: true });
      apiService.removeFavorite.mockResolvedValue({ message: 'Removed' });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Favorited')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByText('Favorited');
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(apiService.removeFavorite).toHaveBeenCalledWith('TEST001');
        expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
      });
    });

    it('should handle favorite toggle error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });
      apiService.addFavorite.mockRejectedValue(new Error('Failed to add'));

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByText('Add to Favorites');
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error toggling favorite:',
          expect.any(Error)
        );
      });

      // Should still show "Add to Favorites" since toggle failed
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should handle checkFavorite error gracefully', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockRejectedValue(new Error('Auth error'));

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
      });

      // Should show "Add to Favorites" as default when check fails
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch correct program by ID', async () => {
      const programs = [
        { program_id: 'TEST001', program_details: { name: 'Program 1' } },
        { program_id: 'TEST002', program_details: { name: 'Program 2' } },
      ];

      apiService.getPrograms.mockResolvedValue(programs);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(screen.getByText('Program 1')).toBeInTheDocument();
        expect(screen.queryByText('Program 2')).not.toBeInTheDocument();
      });
    });

    it('should make parallel API calls', async () => {
      apiService.getPrograms.mockResolvedValue([mockProgram]);
      apiService.checkFavorite.mockResolvedValue({ is_favorite: false });

      renderWithRouter(<ProgramDetail />);

      await waitFor(() => {
        expect(apiService.getPrograms).toHaveBeenCalled();
        expect(apiService.checkFavorite).toHaveBeenCalled();
      });

      // Both should be called before component finishes loading
      expect(apiService.getPrograms).toHaveBeenCalledTimes(1);
      expect(apiService.checkFavorite).toHaveBeenCalledTimes(1);
    });
  });
});
