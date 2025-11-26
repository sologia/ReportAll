app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

app.use((err, req, res, next) => {