/**
 * Home Page Tests
 * Tests favorites fetching, message display, and navigation
 */
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';
import apiService from '../../services/api';
import { renderWithRouter, createMockProgram } from '../../utils/testUtils';

jest.mock('../../services/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render main sections', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      expect(screen.getByText('Explore Programs')).toBeInTheDocument();
      expect(screen.getByText('My Favorite Programs')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('should render explore programs button', () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      const exploreButton = screen.getByRole('button', { name: /explore programs/i });
      expect(exploreButton).toBeInTheDocument();
    });
  });

  describe('Favorites Section', () => {
    it('should fetch favorites on mount', async () => {
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Study in Paris' },
            location: 'Paris, France',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(apiService.getFavorites).toHaveBeenCalledTimes(1);
      });
    });

    it('should display favorite programs', async () => {
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Study in Paris' },
            location: 'Paris, France',
          },
        },
        {
          program: {
            program_id: 'TEST002',
            program_details: { name: 'Study in Tokyo' },
            location: 'Tokyo, Japan',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
        expect(screen.getByText('Study in Tokyo')).toBeInTheDocument();
      });
    });

    it('should display location as secondary text', async () => {
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Study in Paris' },
            location: 'Paris, France',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Paris, France')).toBeInTheDocument();
      });
    });

    it('should show message when no favorites exist', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/no favorite programs yet/i)
        ).toBeInTheDocument();
      });
    });

    it('should navigate to program detail when favorite is clicked', async () => {
      const user = userEvent.setup();
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Study in Paris' },
            location: 'Paris, France',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Study in Paris'));

      expect(mockNavigate).toHaveBeenCalledWith('/programs/TEST001');
    });

    it('should handle fetch favorites error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      apiService.getFavorites.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching favorites:',
          expect.any(Error)
        );
      });

      expect(
        screen.getByText(/no favorite programs yet/i)
      ).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should set empty favorites on authentication error', async () => {
      apiService.getFavorites.mockRejectedValue(new Error('Not authenticated'));

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/no favorite programs yet/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Messages Section', () => {
    it('should display hardcoded messages', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Sophia Carter')).toBeInTheDocument();
        expect(screen.getByText('Ethan Walker')).toBeInTheDocument();
        expect(screen.getByText('Olivia Bennett')).toBeInTheDocument();
        expect(screen.getByText('Liam Harper')).toBeInTheDocument();
      });
    });

    it('should display program names in message secondary text', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Alumni, Art History')).toBeInTheDocument();
        expect(screen.getByText('Alumni, Spanish Language')).toBeInTheDocument();
        expect(screen.getByText('Alumni, Japanese Culture')).toBeInTheDocument();
        expect(screen.getByText('Alumni, French Literature')).toBeInTheDocument();
      });
    });

    it('should display avatar with first letter of name', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument(); // Sophia
        expect(screen.getByText('E')).toBeInTheDocument(); // Ethan
        expect(screen.getByText('O')).toBeInTheDocument(); // Olivia
        expect(screen.getByText('L')).toBeInTheDocument(); // Liam
      });
    });

    it('should navigate to message detail when message is clicked', async () => {
      const user = userEvent.setup();
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Sophia Carter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sophia Carter'));

      expect(mockNavigate).toHaveBeenCalledWith('/messages/1');
    });

    it('should navigate to correct message ID', async () => {
      const user = userEvent.setup();
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Liam Harper')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Liam Harper'));

      expect(mockNavigate).toHaveBeenCalledWith('/messages/4');
    });
  });

  describe('Explore Programs Button', () => {
    it('should navigate to map when explore button is clicked', async () => {
      const user = userEvent.setup();
      apiService.getFavorites.mockResolvedValue([]);

      renderWithRouter(<Home />);

      const exploreButton = screen.getByRole('button', { name: /explore programs/i });
      await user.click(exploreButton);

      expect(mockNavigate).toHaveBeenCalledWith('/map');
    });
  });

  describe('Layout', () => {
    it('should render in grid layout', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      const { container } = renderWithRouter(<Home />);

      const grid = container.querySelector('[class*="MuiGrid-container"]');
      expect(grid).toBeInTheDocument();
    });

    it('should render Paper components for sections', async () => {
      apiService.getFavorites.mockResolvedValue([]);

      const { container } = renderWithRouter(<Home />);

      const papers = container.querySelectorAll('[class*="MuiPaper"]');
      expect(papers.length).toBeGreaterThanOrEqual(2); // At least favorites and messages
    });
  });

  describe('Data Mapping', () => {
    it('should correctly map favorite data from API response', async () => {
      const mockFavorites = [
        {
          id: 1,
          created_at: '2024-01-01',
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Paris Program' },
            location: 'Paris',
          },
        },
        {
          id: 2,
          created_at: '2024-01-02',
          program: {
            program_id: 'TEST002',
            program_details: { name: 'Tokyo Program' },
            subtitle: 'Cultural Exchange',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Paris Program')).toBeInTheDocument();
        expect(screen.getByText('Tokyo Program')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('Cultural Exchange')).toBeInTheDocument();
      });
    });

    it('should use subtitle when location is not available', async () => {
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Study Program' },
            subtitle: 'Cultural Studies',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Cultural Studies')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Interactions', () => {
    it('should handle multiple favorite clicks', async () => {
      const user = userEvent.setup();
      const mockFavorites = [
        {
          program: {
            program_id: 'TEST001',
            program_details: { name: 'Program 1' },
            location: 'Location 1',
          },
        },
        {
          program: {
            program_id: 'TEST002',
            program_details: { name: 'Program 2' },
            location: 'Location 2',
          },
        },
      ];

      apiService.getFavorites.mockResolvedValue(mockFavorites);

      renderWithRouter(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Program 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Program 1'));
      expect(mockNavigate).toHaveBeenCalledWith('/programs/TEST001');

      await user.click(screen.getByText('Program 2'));
      expect(mockNavigate).toHaveBeenCalledWith('/programs/TEST002');

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });
});
