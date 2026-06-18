import GitHubButton from 'react-github-btn';
import { useNavigate } from 'react-router-dom';
import { AiFillInfoCircle } from 'react-icons/ai';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer>
      <div className="flex justify-center">
        <AiFillInfoCircle
          onClick={() => navigate('/about')}
          size={30}
          className="mx-3 my-1 cursor-pointer text-primary hover:text-secondary"
        />
      </div>
      <div className="flex items-center justify-center">
        <p className="my-1 text-center text-textColor font-open">
          Made with ♥ by Fatur
        </p>
        <div className="items-center mx-2 mt-auto mb-0">
          <GitHubButton
            href="https://github.com/Faturrachman-dev/nexc-playerlist"
            data-icon="octicon-star"
            data-show-count="true"
            aria-label="Star Faturrachman-dev/nexc-playerlist on GitHub"
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </footer>
  );
}
