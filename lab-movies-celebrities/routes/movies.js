const router = require("express").Router()
const Movie = require("../models/Movie")
const Celebrity = require("../models/Celebrity")

// Create movie
router.get("/movies/create", (req, res, next) => {
    Celebrity.find()
    .then(celebrities => {
        res.render("movies/new-movie", { celebrities })
    })
    .catch(err => {
        next(err)
    })
})

router.post("/movies/create", (req, res) => {
    const { title, genre, plot, cast } = req.body

    Movie.create({
        title,
        genre,
        plot,
        cast
    })
    .then(createdMovie => {
        res.redirect("/movies")
    })
    .catch(err => {
        res.render("movies/new-movie")
    })
})

// Get movies
router.get("/movies", (req, res, next) => {
    Movie.find()
    .then(movies => {
        res.render("movies/movies", { movies })
    })
    .catch(err => {
        next(err)
    })
})

// Get movie details
router.get("/movies/:id", (req, res, next) => {
    const id = req.params.id

    Movie.findById(id)
    .populate("cast")
    .then(movie => {
        res.render("movies/movie-details", { movie })
    })
    .catch(err => {
        next(err)
    })
})

// Delete movie
router.post("/movies/:id/delete", (req, res, next) => {
    const id = req.params.id

    Movie.findByIdAndDelete(id)
    .then(deletedMovie => {
        res.redirect("/movies")
    })
    .catch(err => {
        next(err)
    })
})

// Edit movie
router.get("/movies/:id/edit", async (req, res, next) => {
    const id = req.params.id

    try {
        const movie = await Movie.findById(id).populate("cast")
        const celebrities = await Celebrity.find()
        const celebritiesNotInCast = filterCelebritiesNotInCast(movie, celebrities)

        res.render("movies/edit-movie", { movie, celebritiesNotInCast })
    } catch (error) {
        next(error)
    }
})

router.post("/movies/:id/edit", (req, res, next) => {
    const id = req.params.id
    const { title, genre, plot, cast } = req.body

    const movie = {
        title,
        genre,
        plot,
        cast
    }

    Movie.findByIdAndUpdate(id, movie)
    .then(createdMovie => {
        res.redirect(`/movies/${id}`)
    })
    .catch(err => {
        next(err)
    })
})

function filterCelebritiesNotInCast(movie, celebrities) {
    return celebrities.filter(celebrity => {
        movie.cast.forEach(movieCelebrity => {
            if (movieCelebrity._id.toString() === celebrity._id.toString()) {
                return false
            }
        })
        return true
    })
}

module.exports = router
