
import { Search } from "lucide-react";

function Hero({ search, setSearch }) {
    return (
        <section className="hero">
            <div className="hero-content">
                <p className="hero-tag">GOOD FOOD, GOOD MOOD</p>

                <h1>
                    Delicious food,
                    <br />
                    delivered to your door.
                </h1>

                <p className="hero-description">
                    Discover the best restaurants and enjoy
                    your favourite meals at home.
                </p>

                <div className="search-box">
                    <Search size={21} />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search restaurants or food..."
                    />

                    <button type="button">Search</button>
                </div>
            </div>
        </section>
    );
}

export default Hero;
