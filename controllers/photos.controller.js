const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (title && author && email && file) {
      // if fields are not empty...

      if (
        !file.type.includes('image') ||
        title.length > 25 ||
        author.length > 50 ||
        !new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g).test(email)
      ) {
        throw new Error('Wrong input!');
      }

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg

      const newPhoto = new Photo({
        title: title.replace(/[\\$'"]/g, '\\$&'),
        author: author.replace(/[\\$'"]/g, '\\$&'),
        email,
        src: fileName,
        votes: 0,
      });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const user = req.socket.remoteAddress;
    const voteId = req.params.id;
    const photoToUpdate = await Photo.findOne({ _id: voteId });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const voter = await Voter.findOne({ user });

      if (voter) {
        if (voter.votes.includes(voteId)) throw new Error();
        voter.votes.push(voteId);
        await voter.save();
      } else {
        await new Voter({ user, votes: [voteId] }).save();
      }

      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
